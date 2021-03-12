const onTimer = require('node-schedule')
const auth = require ('../modules/auth')
const process = require ('../modules/process')
//定时任务:每天刷新Cookie保持最新
const getNewCookie = ()=>{
    onTimer.scheduleJob('0 0 0 * * *',async ()=> { //修正错误,每天0:00:00刷新
        await auth.refreshCookie();
    })
}


//定时任务:定时获取视频列表并添加到数据库
const getVideoInfo = ()=>{
    onTimer.scheduleJob('1 * * * * *',async ()=>{
        console.log('GetVideoInfoAccess')
        //开发预留...
    })
}

//定时发送直播中需要发送的弹幕
const sendOnLiveMessage = ()=>{
    onTimer.scheduleJob('0,10,20,30,40,50 * * * * *',async ()=>{//每十分钟发送一次
        await process.sendOnLiveMessage()
    })
}

module.exports ={
    getNewCookie,
    getVideoInfo,
    sendOnLiveMessage
}
