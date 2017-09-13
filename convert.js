var lineReader = require('line-reader'),
    Promise = require('bluebird');
var fs = require('fs');
var iconv = require('iconv-lite');
var eachLine = Promise.promisify(lineReader.eachLine);

var soldAddrAsc = function(x,y) {
    if(x['addr'] > y['addr']){
        return 1
    } else {
        return -1
    }
}

var addrArr = [];
var ethArr = [];
async function init() {
    var file = "/Users/keithdu/NodeJsProjects/ico/refund_success.csv";
    console.time("begin read file: "+file);
    var array = []
    await eachLine(file, function(line) {
        var itemArr = line.split(",")
        if(itemArr.length != 5) throw new Error("line lenght != 5 , line: "+line);
        if(itemArr[0] == ""){
            console.log("empty:"+line)
        } else {
            var eth = Number(itemArr[3].substring(1, itemArr[3].length-1)) + 0.000000001;
            eth = Math.floor(eth * 100)*1e+16;
            if(eth == 0){
                console.log("WARNNING: address: "+itemArr[1]+" eth:0")
                return
            }
            array.push({addr:itemArr[1], eth:eth})
        }
    });
    await array.sort(soldAddrAsc);
    await array.forEach(function(item, index){
        addrArr.push(item.addr)
        ethArr.push(item.eth)
    })
    if(addrArr.length != ethArr.length){
        throw new Error("addrArr.length:"+addrArr.length+" != ethArr.length:"+ethArr.length);
    }
    console.log('done! totally REFUND record:'+addrArr.length);
    await split(100)
}

async function split(onceTake){
    var loop = Math.ceil(addrArr.length / onceTake);
    var file = "/Users/keithdu/convert_170913.json";
    await clearFile(file);

    for(var i = 0;i < loop; i++) {
        var from = onceTake * i;
        var to = onceTake * (i+1);
        var addrSplit = addrArr.slice(from, to);
        var ethSplit = ethArr.slice(from, to);
        var exportStr = "\r\n\n\r\n[";
        exportStr += addrSplit.toString();
        exportStr += "]";

        exportStr += "\r\n["
        exportStr += ethSplit.toString();
        exportStr += "]\r\n\r\n";
        exportStr += await log(ethSplit)
        await appendFile(file, exportStr)
    }
}

async function log(arr){
    var num = 0, totalEth = 0;
    for (var i = 0; i < arr.length; i++) {
        num++;
        totalEth += Number(arr[i]);
    }
    var log = "num:"+num+" eth:"+totalEth/1e+18
    return log
}

async function clearFile(file){
    var arr = iconv.encode("", 'gbk');

    await fs.writeFile(file, arr, function(err){
        if(err)
            console.log("fail " + err);
        else
            console.log("清理文件ok");
    });
}

async function appendFile(file, content){
    var arr = iconv.encode(content, 'gbk');

    await fs.appendFile(file, arr, function(err){
        if(err)
            console.log("fail " + err);
        else
            console.log("写入文件ok");
    });
}

init()
