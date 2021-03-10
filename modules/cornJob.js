const onTimer = require('node-schedule')
const auth = require ('../modules/auth')
//定时任务:每天刷新Cookie保持最新
const getNewCookie = ()=>{
    onTimer.scheduleJob('* * 1 * * *',async ()=> {
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


module.exports ={
    getNewCookie,
    getVideoInfo
}