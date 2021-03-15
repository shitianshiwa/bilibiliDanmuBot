const aiReply = require('./ai')
const config = require('../utils/config')
const logger = require('../utils/logger')
const reply = require('./sendreply')

//=================读取配置项防止频繁的文件请求=========================
const allowAiReply = config.get('configInfo.enableAi')
const liveRoom = config.get('bilibiliInfo.roomId')
const triggerPrefix = config.get('configInfo.triggerPrefix')
const enableAiChat = config.get('configInfo.enableAiFunction.enableAiChat')

const danmuJob = async (msg) => {//用户发送弹幕后的各项操作
    logger.danmu(msg.info[2][1], msg.info[1])
    await aiChatReplyCheck(msg.info[2][0], msg.info[1])
}

const giftJob = async (msg) => {//用户送礼后进行的各项操作
    logger.gift(msg.data.uname,msg.data.giftName,msg.data.coin_type,msg.data.num)
    //TODO:将gift的信息集合后进行推送-或一定时间内仅发送一次礼物感谢消息
}

const joinJob = async (msg) => {
    logger.userJoin(msg.data.uname)
    //TODO:在用户进入时，获取时间差并进行自动化欢迎语的调用
}

const superChatJob = async (msg) =>{
    logger.superChatMessage(msg.data.user_info.uname,mag.data.message,msg.data.price)
    await reply.sendSuperChatThanks(msg.data.user_info.uname,msg.data.price)
}
//舰长进入直播间
const guardJoinJob = async (msg) =>{
    logger.guardJoin(msg.data.copy_writing)
}

const anchorLotStart = async (msg) => {
    logger.anchorLotStart(msg.data.award_name,msg.data.award_num)
    await reply.sendOnAnchorLotStart()
}


//天选抽奖完成提示
const anchorLotEnd = async  (msg) => {
    logger.anchorLotEnd()
    logger.debug(msg)
    await reply.sendOnAnchorLotEnd()
}

const newGuardJob = async (msg) =>{ //新的舰长上舰
    logger.guardBuy(msg.data.username,msg.data.guard_level)
    await reply.sendNewGuardThanks(msg.data.username,msg.data.guard_level)
}

const liveStartJob = async () =>{
    await reply.sendOnLiveStart()
}

const liveEndJob = async () =>{
    await reply.sendOnLiveEnd()
}

const infoUpdate = async (fans,fans_club,online) =>{
    logger.roomRealTimeMessage(fans,fans_club,online)
}


//检查AI回复的各项事务并进行针对处理
const aiChatReplyCheck = async (uid, msg) => {
    if (msg.substring(0, 1) !== triggerPrefix) {
        return
    }//若不能匹配到触发字符，则取消执行
    if (allowAiReply === false) {
        return
    }//若AI回复功能主开关为关闭状态，则取消执行
    switch (msg.substring(1)) {
        case '个人信息':
            //预留
        break

        case '极速切片':
            await reply.quickClip()
        break
        //将来的智能命令预留

        //默认为AI聊天功能
        default:
            //检查是否启用AI聊天
            if (enableAiChat === false) {
                return
            }
            //调用AI发送回答
            await aiReply.replyChat(liveRoom, uid, msg.substring(1))
        break
    }

}


module.exports = {
    danmuJob,
    giftJob,
    joinJob,
    infoUpdate,
    guardJoinJob,
    newGuardJob,
    anchorLotStart,
    anchorLotEnd,
    liveEndJob,
    liveStartJob,
    superChatJob
}
