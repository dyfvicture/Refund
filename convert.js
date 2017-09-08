var lineReader = require('line-reader'),
    Promise = require('bluebird');
var fs = require('fs');
var iconv = require('iconv-lite');
var eachLine = Promise.promisify(lineReader.eachLine);

var addrArr = [];
var ethArr = [];

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
            eth = Math.floor(eth * 100)*10000000000000000;
            ethArr.push(eth);
        }
    });
    if(addrArr.length != ethArr.length){
        throw new Error("addrArr.length:"+addrArr.length+" != ethArr.length:"+ethArr.length);
    }
    console.log('done! totally REFUND record:'+addrArr.length);

    await split(100)
}

async function split(onceTake){
    var loop = Math.ceil(addrArr.length / onceTake)
    var file = "/Users/keithdu/export.json"
    await clearFile(file)
    for(var i = 0;i < loop; i++) {
        var from = onceTake * i;
        var to = onceTake * (i+1);
        var addrSplit = addrArr.slice(from, to);
        var ethSplit = ethArr.slice(from, to);
        var exportStr = "\r\n\n\r\n address:[";
        exportStr += addrSplit.toString();
        exportStr += "]";

        exportStr += "\r\n eth:["
        exportStr += ethSplit.toString();
        exportStr += "]\r\n";
        await appendFile(file, exportStr)
    }
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