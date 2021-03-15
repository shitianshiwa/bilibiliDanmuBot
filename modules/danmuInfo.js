const logger = require('../utils/logger')
const config = require('../utils/config')
const process = require('./process')
const danMu = require('bilibili-live-ws')
const danMuSrc = require('bilibili-live-ws/src')
const type = require('typedi')


function connect (){
    const live = new danMuSrc.KeepLiveTCP(config.get('bilibiliInfo.roomId'))
    type.Container.set(danMu.KeepLiveTCP,live)
    let onLine = 0;

    live.on('live',()=> logger.connectToLiveRoom('ok',config.get('bilibiliInfo.roomId'),config.get('streamInfo.owner')))

    live.on('heartbeat', (e)=>{onLine=e})

    live.on('msg',async (msg)=>{
        switch (msg.cmd) {
            case 'NOTICE_MSG'://全区公告
                logger.noticeMsg(msg.msg_common)
            break

            case 'DANMU_MSG'://用户发送弹幕
                await process.danmuJob(msg)
            break

            case 'SUPER_CHAT_MESSAGE':
                await process.superChatJob(msg)
            break

            case 'SEND_GIFT':
                //礼物发送消息
                await process.giftJob(msg)
            break

            case 'COMBO_SEND'://礼物连击发送结果,包含礼物总量等
                logger.debug(`用户${msg.data.uname},赠送礼物${msg.data.gift_name}共${msg.data.combo_num}个`)
            break

            case 'GUARD_BUY': //舰长购买消息-需要交给process.js
                await process.newGuardJob(msg)
            break

            case 'INTERACT_WORD'://房间用户进入
                await process.joinJob(msg)
            break

            case 'WELCOME_GUARD'://大航海用户进入直播间
                await process.guardJoinJob(msg)
            break

            case 'ANCHOR_LOT_START':  //天选抽奖标签
                await process.anchorLotStart(msg)
            break

            case 'ANCHOR_LOT_END':  //天选抽奖结束
                await process.anchorLotEnd(msg)
            break

            case 'ENTRY_EFFECT'://特殊用户进入房间,作用未知
                await process.guardJoinJob(msg)
            break

            case 'ROOM_BANNER': //房间Banner更新消息
                logger.debug('收到房间Banner更新,暂不做处理')
                logger.debug(JSON.stringify(msg))
            break

            case 'ONLINE_RANK_V2': //人气排行榜v2版更新消息
                logger.debug('收到在线排行榜更新消息,不进行处理')
            break

            case 'ONLINE_RANK_COUNT': //人气排行榜当前所在位数
                logger.debug(`主播当前在天梯排行榜第 ${msg.data.count} 位!`)
            break

            case 'PK_BATTLE_PROCESS':
                //这里是大乱斗过程中的更新消息
            break

            case 'PK_BATTLE_PROCESS_NEW':
                //这里是大乱斗过程中的更新消息
            break

            case 'PK_BATTLE_END':
                logger.debug('PK大乱斗结束.')
            break

            case 'PK_BATTLE_SETTLE_USER':
                //PK结果信息
            break

            case 'PK_BATTLE_SETTLE_V2':
                //PK结果信息V2
            break

            case '"PK_BATTLE_SETTLE_USER':
                //PK结果信息全面展示
            break

            case 'WIDGET_BANNER': //直播间顶部推广消息更新
                logger.debug(`收到小工具超链接更新消息,忽略不做处理`)
            break

            case 'HOT_RANK_CHANGED': //热门榜单更新
                logger.debug('收到热门榜单更新消息,不进行处理')
            break

            case 'ONLINE_RANK_TOP3'://高能榜前三公告消息
                logger.debug('收到高能榜前三公告消息,不进行处理')
            break

            case 'ROOM_REAL_TIME_MESSAGE_UPDATE'://房间实时消息更新
                await process.infoUpdate(msg.data.fans,msg.data.fans_club,onLine)
            break

            case 'LIVE'://开始直播,并非开始推流,若返回live_key及sub_session_key，则为开播按钮被按下,若仅有live，则为推流开始
                logger.debug('直播开始!')
                global.liveStatus = 1
                await process.liveStartJob()
            break

            case 'PREPARING': //直播结束,即使开启了轮播也会返回该消息
                logger.debug('直播结束!')
                global.liveStatus = 0
                await process.liveEndJob()
            break

            default:
                logger.debug(JSON.stringify(msg))
            break
            //TODO:完成SuperChat的事件处理
        }

    })
}

function disconnect (){
    //开发预留
}


exports.connect = connect
exports.disconnect = disconnect