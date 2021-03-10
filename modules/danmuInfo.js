const logger = require('../utils/logger')
const config = require('../utils/config')
const process = require('./process')
const danMu = require('bilibili-live-ws')
const danMuSrc = require('bilibili-live-ws/src')
const type = require('typedi')

function connect (){
    const live = new danMuSrc.KeepLiveTCP(config.get('bilibiliInfo.roomId'))
    type.Container.set(danMu.KeepLiveTCP,live)

    live.on('live',()=> logger.connectToLiveRoom('ok',config.get('bilibiliInfo.roomId'),config.get('streamInfo.owner')))

    live.on('DANMU_MSG',async (msg)=>{
        await process.danmuJob(msg)
    })
}

function disconnect (){
    //开发预留
}


exports.connect = connect
exports.disconnect = disconnect



