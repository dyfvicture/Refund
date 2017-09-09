var lineReader = require('line-reader'),
    Promise = require('bluebird');
var fs = require('fs');
var iconv = require('iconv-lite');
var eachLine = Promise.promisify(lineReader.eachLine);

var addrArr = [];
var ethArr = [];

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

var refundArr =[];
async function init(refundTx) {
    var file = "/Users/keithdu/export-token-0xef68e7c694f40c8202821edf525de3782458639f.csv";
    console.time("begin read file: " + file);
    var refund = [];
    await eachLine(file, function (line) {
        var itemArr = line.split(",")
        if (itemArr.length != 7) throw new Error("line lenght != 7 , line: " + line);
        if (itemArr[0] == "\"Txhash\"" || itemArr[0] == "") {
            console.log("REFUND empty:" + line)
        } else {
            refund.push({
                tx: itemArr[0].substring(1, 67),
                blockno: itemArr[1],
                timestamp: itemArr[2],
                time: itemArr[3],
                from: itemArr[4].substring(1, 43),
                to: itemArr[5].substring(1, 43),
                quantity: itemArr[6].substring(1, itemArr[6].length - 1)
            });
        }
    });
    refundArr = await refund.concat().reverse();
    var pos = 0;
    index = await refundArr.forEach(function(item, index){
        if(item.tx == refundTx) {
            console.log(item.tx+" == "+refundTx)
            pos = index;
            return
        }
    })
    console.log(pos)
}

init("0x1320f6fe8eebdb60b9a55e4a869a2f966b84623e43e377203c15e025e7a5e49f")
