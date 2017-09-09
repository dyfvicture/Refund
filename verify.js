var lineReader = require('line-reader'),
    Promise = require('bluebird');
var fs = require('fs');
var iconv = require('iconv-lite');
var eachLine = Promise.promisify(lineReader.eachLine);

var addrArr = [];
var ethArr = [];

var addrAsc = function(x,y) {
    if(x['addr'] > y['addr']){
        return 1
    } else if(x['addr'] == y['addr']){
        if(Number(x['eth']) > Number(y['eth'])){
            return 1
        } else {
            return -1
        }
    } else {
        return -1
    }
}

var outputArr = [];
var arr = [];
async function init() {
    var file = "/Users/keithdu/NodeJsProjects/ico/refund_success.csv";
    console.time("begin read file: "+file);
    await eachLine(file, function(line) {
        var itemArr = line.split(",")
        if(itemArr.length != 5) throw new Error("line lenght != 5 , line: "+line);
        if(itemArr[0] == ""){
            console.log("empty:"+line)
        } else {
            var eth = Number(itemArr[3].substring(1, itemArr[3].length-1));
            arr.push({addr:itemArr[1], eth:eth});
        }
    });
    await arr.sort(addrAsc)
    console.log('done! totally REFUND record:'+addrArr.length);
    await arr.forEach(function(item, index){
        outputArr.push(item.addr+":"+item.eth+"\r\n");
    })

    var file = "/Users/keithdu/new.json";
    await clearFile(file);
    await appendFile(file, outputArr)
}

async function init1() {
    var file1 = "/Users/keithdu/2017-09-08/imtoken/refund_success.csv";
    var file2 = "/Users/keithdu/2017-09-08/official/refund_success.csv";
    console.time("begin read file: "+file1);
    await eachLine(file1, function(line) {
        var itemArr = line.split(",")
        if(itemArr.length != 5) throw new Error("line lenght != 5 , line: "+line);
        if(itemArr[0] == ""){
            console.log("empty:"+line)
        } else {
            var eth = Number(itemArr[3].substring(1, itemArr[3].length-1));
            arr.push({addr:itemArr[1], eth:eth});
        }
    });
    await eachLine(file2, function(line) {
        var itemArr = line.split(",")
        if(itemArr.length != 5) throw new Error("line lenght != 5 , line: "+line);
        if(itemArr[0] == ""){
            console.log("empty:"+line)
        } else {
            var eth = Number(itemArr[3].substring(1, itemArr[3].length-1));
            arr.push({addr:itemArr[1], eth:eth});
        }
    });
    await arr.sort(addrAsc)
    console.log('done! totally REFUND record:'+addrArr.length);
    await arr.forEach(function(item, index){
        outputArr.push(item.addr+":"+item.eth+"\r\n");
    })

    var file = "/Users/keithdu/new.json";
    await clearFile(file);
    await appendFile(file, outputArr)
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

init1()


