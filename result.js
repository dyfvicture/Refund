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

// 要来统计结果，总共需要退款的笔数，总共要退的以太数量
var totalEth = 0;
async function init() {
    var file = "/Users/keithdu/NodeJsProjects/ico/refund_success.csv";
    console.time("begin read file: "+file);
    await eachLine(file, function(line) {
        var itemArr = line.split(",")
        if(itemArr.length != 5) throw new Error("line lenght != 5 , line: "+line);
        if(itemArr[0] == ""){
            console.log("empty:"+line)
        } else {
            addrArr.push(itemArr[1]);
            var eth = Number(itemArr[3].substring(1, itemArr[3].length-1));
            //console.log(itemArr[3]+"  |||| "+ eth+" * 100 * 10^6 = "+(Math.floor(eth * 100)*10000000000000000))
            eth = Math.floor(eth * 100)*1e+16;
            ethArr.push(eth);

            var a = Math.floor(eth * 100) / 100;
            totalEth += a;
        }
    });
    if(addrArr.length != ethArr.length){
        throw new Error("addrArr.length:"+addrArr.length+" != ethArr.length:"+ethArr.length);
    }
    console.log('done!');
    console.log("total refund:"+addrArr.length)
    console.log("total refund eth:"+totalEth)
    //await split(100)
}

init()
