const logger = require('../utils/logger')
const config = require('../utils/config')
const danMu = require('bilibili-live-ws')
const danMuSrc = require('bilibili-live-ws/src')
const type = require('typedi')

const live = new danMuSrc.KeepLiveTCP(config.get('bilibiliInfo.roomId'))

type.Container.set(danMu.KeepLiveTCP,live)
live.on('live',()=> logger.connectToLiveRoom('ok',config.get('bilibiliInfo.roomId'),''))