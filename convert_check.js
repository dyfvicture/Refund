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
    } else {
        return -1
    }
}

// 将要退款的记录输出  地址:eth，地址升序排列，方便比较
var array = [];
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
            array.push({addr: itemArr[1], eth:eth})
        }
    });
    if(addrArr.length != ethArr.length){
        throw new Error("addrArr.length:"+addrArr.length+" != ethArr.length:"+ethArr.length);
    }
    await array.sort(soldAddrAsc)
    console.log('done! totally REFUND record:'+addrArr.length);

    await output()
}

async function output(){
    var file = "/Users/keithdu/convert_check.json";
    await clearFile(file);
    var exportStr = "";
    array.forEach(function(item, index){
        exportStr += item.addr;
        exportStr += ":"+item.eth;
        exportStr += "\r\n"
    })
    await appendFile(file, exportStr)
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
