var lineReader = require('line-reader'),
    Promise = require('bluebird');
var eachLine = Promise.promisify(lineReader.eachLine);

async function checkData() {
    var file = "/Users/keithdu/NodeJsProjects/ico/refund_success.csv";
    var num = 0, totalLrc = 0, totalEth = 0;
    console.time("begin read file: "+file);
    var largestRatio = 0, smallestRatio = 0;
    await eachLine(file, function(line) {
        var itemArr = line.split(",")
        num++;
        var currentLrc = Number(itemArr[2].substring(1, itemArr[2].length-1));
        totalLrc += currentLrc;
        var currentEth = Number(itemArr[3].substring(1, itemArr[3].length-1));
        totalEth += currentEth;
        var currentRatio = currentLrc / currentEth;
        if(currentRatio > 6000) console.log(itemArr[0]+" "+currentLrc +"/"+ currentEth+"="+currentRatio)
        if(currentRatio > largestRatio) largestRatio = currentRatio;
        if(smallestRatio == 0 || smallestRatio > currentRatio) smallestRatio = currentRatio;
    });

    console.log('done! refund count:'+num+" lrc:"+totalLrc+" eth:"+totalEth);
    console.log("average ratio(eth~lrc)："+(totalLrc/totalEth)+" largest:"+largestRatio+" smallest:"+smallestRatio)
}

checkData()


function a(){
    var arr = [1170000000000000000,7000000000000000000,4990000000000000000,10000000000000000000,27990000000000000000,1200000000000000000,2980000000000000000,470000000000000000,350000000000000000,49890000000000000000,202000000000000000000,960000000000000000,7500000000000000000];
    var total = 0;
    for(var i =0; i< arr.length; i++){
        total += arr[i];
    }
    console.log(total)
}