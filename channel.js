var lineReader = require('line-reader'),
    Promise = require('bluebird');
var eachLine = Promise.promisify(lineReader.eachLine);
var fs = require('fs');

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
            sold.push({no:itemArr[0], addr:itemArr[1], tx:itemArr[2], eth:itemArr[3], lrc:itemArr[4], price:itemArr[5], chanel:itemArr[6]});
        }
    });
    console.log('done! totally SOLD record:'+sold.length);
    soldAddrArr = await sold.concat();
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

// 币交所 AimWise bitcoinworld btc123 ICO365 IcoRace TokenCapital
var officialSoldArr = [], bjsSoldArr = [], aimWiseSoldArr = [], bitcoinworldSoldArr = [], btc123SoldArr = [], ICO365SoldArr = [],
    icoRaceSoldArr = [], tokenCapitalSoldArr = [];
async function filterChannel(){
    await initTotalSold();
    await initImtokenSold();

    await soldAddrArr.forEach(function(soldItem, index){
        if(soldItem.chanel != ""){
            switch(soldItem.chanel){
                case '币交所':
                    bjsSoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
                    break;
                case 'AimWise':
                    aimWiseSoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
                    break;
                case 'bitcoinworld':
                    bitcoinworldSoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
                    break;
                case 'btc123':
                    btc123SoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
                    break;
                case 'ICO365':
                    ICO365SoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
                    break;
                case 'IcoRace':
                    icoRaceSoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
                    break;
                case 'TokenCapital':
                    tokenCapitalSoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
                    break;
                default:
                    throw new Error("unhandled channel "+soldItem.chanel);
            }
        } else { //imtoken和官网
            if(imtokenArr.indexOf(soldItem.tx) <0){ //官网
                officialSoldArr.push({a:1, tx:soldItem.tx, b:2, c:3, d:4});
            }
        }
    });
    console.log("official:"+officialSoldArr.length+" imtoken:"+imtokenArr.length+" 币交所:"+bjsSoldArr.length+" aimwise:"+aimWiseSoldArr.length+" bitcoinworld:"+bitcoinworldSoldArr.length+" btc123:"
        +btc123SoldArr.length+" ICO365:"+ICO365SoldArr.length+" icoRace:"+icoRaceSoldArr.length+" tokenCapital:"+tokenCapitalSoldArr.length);
    console.log(officialSoldArr.length+imtokenArr.length+bjsSoldArr.length+aimWiseSoldArr.length+bitcoinworldSoldArr.length+btc123SoldArr.length+ICO365SoldArr.length+icoRaceSoldArr.length+tokenCapitalSoldArr.length);

    var official = arrayToCSVStr([], officialSoldArr);
    fs.writeFileSync("official.csv", official);

    var bjs = arrayToCSVStr([], bjsSoldArr);
    fs.writeFileSync("bjs.csv", bjs);

    var aimwise = arrayToCSVStr([], aimWiseSoldArr);
    fs.writeFileSync("aimwise.csv", aimwise);

    var bitcoinworld = arrayToCSVStr([], bitcoinworldSoldArr);
    fs.writeFileSync("bitcoinworld.csv", bitcoinworld);

    var btc123 = arrayToCSVStr([], btc123SoldArr);
    fs.writeFileSync("btc123.csv", btc123);

    var ICO365 = arrayToCSVStr([], ICO365SoldArr);
    fs.writeFileSync("ICO365.csv", ICO365);

    var icoRace = arrayToCSVStr([], icoRaceSoldArr);
    fs.writeFileSync("icoRace.csv", icoRace);

    var tokenCapital = arrayToCSVStr([], tokenCapitalSoldArr);
    fs.writeFileSync("tokenCapital.csv", tokenCapital);
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

filterChannel()