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

var filterArr = [
    "0x05E9E10A7050f735Da07802233109f7c8E4596f6",
    "0x098bC03369cE5ce87C5Bed75CFf384009cBaaAb5",
    "0x1BB5274385b60b1684b3578E6F7F5eFBf1Bc957A",
    "0x1c81360A0b9886940D835BF242667C0698ed877B",
    "0x1E5899e177463Dd64Ae82C6a2bc31bfD84eb874F",
    "0x2a770ef4c3E69E693f50dA7aD8424539f1fD71B2",
    "0x376623a9d6F9A97D2Cd9016AE1B5F9bcb1fE7533",
    "0x39819DB8B1471Dd4F409c2156cf723E563b7f5FC",
    "0x428502e8E881b5D3B2e30C7CAb31D0b504D33e71",
    "0x442838c0F5823df6aA0b735A63189aA5E4039c6d",
    "0x4Bc9D7156Ab833c920065E0631223CAcF85E7Ba3",
    "0x515373dd3e18fa9376E33C5568098426525fBb87",
    "0x54FBF5ea3099247eD6f827bAC2f910Ae735eAa43",
    "0x557DB035CF37D5a7919A78fF95DB50daDeA2F49a",
    "0x57E7f599506CaDeBa18840994225EEd0C5351D45",
    "0x5Da52a12dBCCFeA49912f1655ba4E11f67ebc9dD",
    "0x6b28568c64Db4B776156FB43542e9c829eDc3D6E",
    "0x70F48B0483Fcf7D8Db007C783fB80193F8f3Df84",
    "0x71626DDeF00f2D929B885965FB78647330A9c82A",
    "0x735D416Af01f8f1c565A0f17Bb2e5Ca86fb181b2",
    "0x74F167dD80abB6db6E68aC8112F3cEc691d1c941",
    "0x810fc4EEC5989A98D31e277002Ca88134b808585",
    "0x82115822Ad9Ad2Ba4D8a87673791e3235D428Ab7",
    "0x87fF4dd5acc2F2B6619c1d5777D67f9148c16C72",
    "0x8924EE3B041E327e35e5f38A38E8d8b951732ADD",
    "0x89d37Ae3f678ea82ba4CC7Dccb7f620120b86e77",
    "0x8d950d0622c94c938a134FF11d4Db2bc7fD6cAbb",
    "0x94E998D9a290E97fA3cFD2F4D0D105855FD588aa",
    "0x979201C485f5978d63919afb7D343B8D10B2e1B6",
    "0x98b7a44138ae232D46603b3658F587DeB13adC17",
    "0xa3ae668B6239fA3eb1dc26DaAbb03f244d0259f0",
    "0xA82a60B0e57a453e8D662C48275De49E9Ec52806",
    "0xad08dFEA2A0B2818884a31a8Ddc3875D9BFAdbB2",
    "0xBC16e12538517193AD13622673943640C4d471bb",
    "0xbE978D590EEe32aDAF21B807AE1D9B279A5b49e5",
    "0xbf130eE69C43bcc23a57d205fB32559Cc61425F8",
    "0xC1dd76C4000608F9c5A960a9C63aE15fA50cD297",
    "0xC20c00eDc2E7de968D2d045Cf5988701bf39EBc2",
    "0xC5f2017536B57dd5ae02733db20B20E2C3cD0D35",
    "0xC82733e7412Df6c9ED80A4Ae2Ec3Ea6028b72f4f",
    "0xdc2e4C038f010Cea4D5F477DE9C8d675e3b9b58c",
    "0xDF0b54e921C53A533B8f7D0B895C006b90957447",
    "0xe0688b9E7C95C6dF71AF2c1ac4d2b18290132C79",
    "0xE0fc7630be73F6c5C224122c7cfC2c2d63Fb7382",
    "0xE32f11dC5c723EF6AC8a580Ac7275d5c8e53C2cc",
    "0xecFb0151a70Bb7639Eae4cCa3b178fA4E05483e6",
    "0xf1875EEDE719877Cf40b67Aa0b2c8b32e5321c26",
    "0xf288eC18EdBD8219FAAF0db33BEb62e44731932e",
    "0xF4C8f2402EBf90303cE0D99902bBa73d3BbBF43c",
    "0xf51DF14e49DA86ABC6F1d8Ccc0B3A6b7b7C90Ca6",
    "0xF662c664A783ceDc3b8d2a33a6d35fa0900e2F78",
    "0xfAb08B782331dA3BDDe9a7F42427dbAbcaB98E35",
    "0x1FBbD7Ba6CD9aC09F935594dd2a54BB82eC6e9eA"
];
var filterLowerArr = [];

var totalEth = 0;
async function init() {
    var file = "/Users/keithdu/NodeJsProjects/ico/refund_success.csv";
    console.time("begin read file: "+file);
    await filterArr.forEach(function(item, index){
        filterLowerArr.push(item.toLowerCase())
    })
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
            var address = itemArr[1].substring(1, itemArr[1].length-1)
            if(filterLowerArr.indexOf(address) > -1){
                var a = Math.floor(eth * 100) / 100;
                totalEth += a;
            }
        }
    });
    if(addrArr.length != ethArr.length){
        throw new Error("addrArr.length:"+addrArr.length+" != ethArr.length:"+ethArr.length);
    }
    console.log('done! totally REFUND record:'+addrArr.length);
    console.log("total eth:"+totalEth)
    //await split(100)
}

async function split(onceTake){
    var loop = Math.ceil(addrArr.length / onceTake);
    var file = "/Users/keithdu/export.json";
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

    log()
}

async function log(arr){
    var num = 0, totalEth = 0;
    for (var i = 0; i < arr.length; i++) {
        num++;
        totalEth += Number(arr[i]);
    }
    var log = "num:"+num+" eth:"+totalEth
    console.log(log)
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
