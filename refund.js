var lineReader = require('line-reader'),
    Promise = require('bluebird');
var eachLine = Promise.promisify(lineReader.eachLine);
var fs = require('fs');
var parse = require('csv-parse');
var assert = require('assert');

function accDiv(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
    }
    try {
        t2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
    }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * pow(10, t2 - t1);
    }
}

//对地址进行升序排序函数
var soldAddrAsc = function(x,y) {
    if(x['addr'] > y['addr']){
        return 1
    } else if(x['addr'] == y['addr']){
        if(Number(x['no']) > Number(y['no'])){
            return 1
        } else {
            return -1
        }
    } else {
        return -1
    }
}

var soldAddrArr = [];
//读取众售记录，按渠道和地址排序
async function initTotalSold() {
    var file = "/Users/keithdu/ICO_Issue_events.csv";
    var sold =[];
    console.time("begin read file: "+file);
    await eachLine(file, function(line) {
        var itemArr = line.split(",")
        if(itemArr.length != 7) throw new Error("line lenght != 7 , line: "+line);
        if(itemArr[0] == "序号" || itemArr[0] == ""){
            console.log("SOLD empty:"+line)
        } else {
            sold.push({no:itemArr[0], addr:itemArr[1], tx:itemArr[2], eth:itemArr[3], lrc:itemArr[4], chanel:itemArr[5]});
        }
    });
    console.log('done! totally SOLD record:'+sold.length);
    soldAddrArr = await sold.sort(soldAddrAsc);
}

var refundArr = []
async function initTotalRefund(){
    var file = "/Users/keithdu/export-token-0xef68e7c694f40c8202821edf525de3782458639f-0912.csv";
    var refund =[];
    console.time("begin read file: "+file);
    await eachLine(file, function(line) {
        var itemArr = line.split(",")
        if(itemArr.length != 7) throw new Error("line lenght != 7 , line: "+line);
        if(itemArr[0] == "\"Txhash\"" || itemArr[0] == ""){
            console.log("REFUND empty:"+line)
        } else {
            refund.push({tx:itemArr[0].substring(1, 67), blockno:itemArr[1], timestamp:itemArr[2], time:itemArr[3], from:itemArr[4].substring(1, 43), to:itemArr[5].substring(1, 43), quantity:itemArr[6].substring(1, itemArr[6].length-1)});
        }
    });
    console.log('done! totally REFUND record:'+refund.length);
    refundArr = await refund.concat().reverse();
}

var imtokenArr = []
async function initImtokenSold(){
    var file = "/Users/keithdu/imtoken_tx.csv";
    console.time("begin read file: "+file);
    await eachLine(file, function(line) {
        var itemArr = line.split(",");
        if(itemArr.length != 5) throw new Error("line lenght != 5 , line: "+line);
        if(itemArr[0] == "序号" || itemArr[0] == ""){
            console.log("SOLD empty:"+line)
        } else {
            imtokenArr.push(itemArr[1].substring(1, 67));
        }
    });
    console.log('done! imtoken SOLD record:'+imtokenArr.length);
}

var refundSuccess = [];  // 包括成功，和超出的一部分
var refundNothing = []; // 没有众售记录
var refundImtoken = []; // imtoken众售部分
var refundAddrMap = {};
var nothing = []

/**
 * 根据众售列表（Sold），退款申请表（refund），过滤列表（imtoken），筛选符合条件的退款记录，并计算需要返还的eth数量
 * fromIndex: 从0开始，包括fromIndex，如果传入>0的值，之前的数据就作为已发放
 * fromAddr: 该条记录的from地址，为了验证
 * toIndex: 处理到的记录
 */
async function refund(fromIndex, txHash){
    await initTotalSold();
    await initTotalRefund();
    await initImtokenSold();

    // soldAddrArr.forEach(function(soldItem, index){
    //     if(soldItem.addr == "0xd94403c46d6a2b5a4be7b9f46042ac33d1a6dd39"){
    //         console.log(soldItem.lrc);
    //     }
    // });

    var originSold = {}
    await soldAddrArr.concat().forEach(function(soldItem, index){
        originSold[soldItem.tx] = soldItem.lrc
    });

    var hasReduce = false;
    await refundArr.forEach(function(refundItem, index){
        if (index == fromIndex) {
            assert(refundItem.tx === txHash, "txHash not equal.");
        }

        if(fromIndex > index){
            if(refundAddrMap[refundItem.from]){
                refundAddrMap[refundItem.from] = refundAddrMap[refundItem.from] + Number(refundItem.quantity)
            } else {
                refundAddrMap[refundItem.from] = Number(refundItem.quantity)
            }
            //console.log(fromIndex +"<"+ index+" 跳过"+refundItem.quantity+" map:"+refundAddrMap[refundItem.from])
            return;
        }

        var soldItems = soldAddrArr.concat().filter(function(soldItem){
            // if(soldItem.addr == "0xd7f37dd3b66a09bcab1d5b500670582791eb95d6"){
            //     console.log(soldItem.tx)
            // }
            return soldItem.addr == refundItem.from
        });

        //console.log(soldItems)
        // 如果有已经退过的，从refund里减掉
        if(!hasReduce && refundAddrMap[refundItem.from]){
            var hasRefund = refundAddrMap[refundItem.from]
            soldItems.forEach(function(soldItem, index){
                var currentSoldLrc = Number(soldItem.lrc)
                if(currentSoldLrc > hasRefund){
                    soldItem.lrc = currentSoldLrc - hasRefund;
                    hasRefund = 0
                } else {
                    soldItem.lrc = 0
                    hasRefund -= currentSoldLrc
                }
            })
            console.log("退过  addr:"+refundItem.from)
            console.log("本次要退"+refundItem.quantity+" 已经退过:"+refundAddrMap[refundItem.from])
            console.log(soldItems)
            hasReduce = true
        }
        //console.log(soldItems)
        if(soldItems.length >0){//找到了众售记录
            var soldLrc = 0; //众售时的计数
            var refundLrc = 0, refundEth = 0; //需要退还的计数
            var requireRefundLrc = Math.floor(Number(refundItem.quantity))//最小退还1个lrc，精度保留到个

            if(refundItem.from == "0xfa1aebd4852f68b4ddc9fb0fba1f66a91eba2f6e"){
                console.log("退了lrc:"+refundItem.quantity)
            }

            var needRefundLrc = requireRefundLrc; //还要退换的lrc数量
            soldItems.forEach(function(soldItem, index){
                // if(soldItem.addr == "0xd7f37dd3b66a09bcab1d5b500670582791eb95d6"){
                //     console.log(soldItem.tx+" "+soldItem.lrc)
                // }
                if(soldItem.chanel != ""){ //不处理机构投资
                    return;
                }
                var currentSoldLrc = Number(soldItem.lrc)
                var currentSoldEth = Number(soldItem.eth)
                if(currentSoldLrc < 0){
                    throw new Error("已经退过？lrc减成了负数");
                }

                if(needRefundLrc > 0){ //还不够退
                    if(refundItem.from == "0xfa1aebd4852f68b4ddc9fb0fba1f66a91eba2f6e"){
                        console.log(index +"=="+ (soldItems.length -1)+" && "+needRefundLrc +">"+ currentSoldLrc)
                    }
                    if(index == (soldItems.length -1) && needRefundLrc > currentSoldLrc){ //多退回了lrc
                        needRefundLrc = currentSoldLrc
                    }
                    if(currentSoldLrc < needRefundLrc){ //本次sold还不够退
                        if(currentSoldLrc >0){
                            if(currentSoldLrc < originSold[soldItem.tx]){ //已经减去了一部分，按比例缩减eth
                                refundEth += accDiv(currentSoldLrc, originSold[soldItem.tx]) * currentSoldEth
                            } else {
                                refundEth += currentSoldEth;
                            }
                            refundLrc += currentSoldLrc;
                            needRefundLrc -= currentSoldLrc;
                        }
                    } else {// sold刚好或多于refund
                        if(refundItem.from == "0xfa1aebd4852f68b4ddc9fb0fba1f66a91eba2f6e"){
                            console.log(needRefundLrc+"/"+originSold[soldItem.tx]+"*"+Number(soldItem.eth))
                        }
                        currentSoldEth = accDiv(needRefundLrc, originSold[soldItem.tx]) * currentSoldEth
                        refundEth += currentSoldEth
                        refundLrc += needRefundLrc;
                        currentSoldLrc = needRefundLrc;
                        needRefundLrc = 0;
                    }
                    soldLrc += currentSoldLrc
                    if(refundItem.from == "0xfa1aebd4852f68b4ddc9fb0fba1f66a91eba2f6e"){
                        console.log("soldLrc:"+currentSoldLrc+" soldEth:"+currentSoldEth+" refundLrc:"+refundLrc+" refundEth:"+refundEth+" requireRefundLrc:"+needRefundLrc)
                    }
                    soldItem.lrc = soldItem.lrc - currentSoldLrc;
                    if(soldItem.lrc <0) throw new Error("减成了负数");

                    if(imtokenArr.indexOf(soldItem.tx) >-1) {
                        refundImtoken.push({refundTx: refundItem.tx, soldTx:soldItem.tx, address: refundItem.from, refundLrc:currentSoldLrc, refundEth:currentSoldEth})
                    }
                    //console.log("soldEth:"+soldEth+" soldLrc:"+currentSoldLrc+" soldEth:"+currentSoldEth+" refundLrc:"+refundLrc+" refundEth:"+refundEth+" requireRefundLrc:"+needRefundLrc)
                }
                if(index == soldItems.length -1){
                    if(soldLrc < Number(refundItem.quantity)){//退的比买的多
                        if(soldLrc == 0){
                            refundNothing.push({tx:refundItem.tx, address: refundItem.from, requireRefundLrc:refundItem.quantity})
                        } else {
                            refundSuccess.push({tx:refundItem.tx, address: refundItem.from, refundLrc:refundLrc, refundEth:refundEth, lrcNotRefund: (requireRefundLrc - soldLrc)})
                        }
                    } else {//足够退
                        refundSuccess.push({tx:refundItem.tx, address: refundItem.from, refundLrc:refundLrc, refundEth:refundEth, lrcNotRefund: 0})
                    }
                }
            });
        } else { //没找到众售记录
            refundNothing.push({tx:refundItem.tx, address: refundItem.from, requireRefundLrc:refundItem.quantity})
        }
    });

    // console.log("succ")
    // console.log(refundSuccess)
    //
    // console.log("nothing")
    // console.log(refundNothing)

    var fileNothing = arrayToCSVStr([], refundNothing);
    fs.writeFileSync("refund_nothing.csv", fileNothing);

    var fileSuccess = arrayToCSVStr([], refundSuccess);
    fs.writeFileSync("refund_success.csv", fileSuccess);

    var fileImtoken = arrayToCSVStr([], refundImtoken);
    fs.writeFileSync("refund_imtoken.csv", fileImtoken);
}

function arrayToCSVStr(header, arrData) {
    var CSV = '';

    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }
        row = row.slice(0, -1);
        CSV += row + '\n';
    }

    //console.log("CSV:", CSV);
    return CSV;
}

refund(1702, "0x55b75e85ac71bfba3b312c743224ac73f497d01b098239aaf93153b3d972d14b");


