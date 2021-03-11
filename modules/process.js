const aiReply = require('./ai')
const config = require('../utils/config')
const logger = require('../utils/logger')
const danmu = require('./biliapi')
const randNumber = require ('../utils/random')

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
//开发预留
}



const sendFollowThanks = async (user) => {//发送对于新观众的感谢消息
    if(config.get('configInfo.enableFollowThanks') !== true){
        return
    }
    let choice = await randNumber.getNumber(0,config.get('autoMessages.onNewFollower').length)
    let pretext = config.get(`autoMessages.onNewFollower.${choice}`,)
    pretext = pretext.replace('(userName)',user)
    await danmu.sendChat(config.get('bilibiliInfo.roomId'),pretext)
}



const sendOnLiveMessage = async () => {//若 configInfo.enableAutoMessages 开启,则此方法被调用时将发送设定好的的自动化消息
    if(config.get('configInfo.enableAutoMessages') !== true){
        return
   }
    let choice = await randNumber.getNumber(0,config.get('autoMessages.onLive').length)
    await danmu.sendChat(config.get('bilibiliInfo.roomId'),config.get(`autoMessages.onLive.${choice}`,))
}




const sendWelcomeMessage = async (user,lastJoinTime) => {
    if(config.get('configInfo.enableAutoWelcome') !== true){//若configInfo.enableAutoWelcome未开启,则不欢迎加入的用户
        return
    }
    if(config.get('autoMessages.onWelcome').length < 1){
        logger.debug('配置文件项目autoMessages.onWelcome中不含任何配置项,请检查配置文件是否正确')
        return
    }
    if (lastJoinTime === 0){ //如果该观众之前从来没加入过，则作为新观众处理
        let newUser = config.get('autoMessages.onWelcome.0')
        if (newUser === undefined || newUser === ""){ //若无法正确读取默认值
            logger.debug('配置文件项目autoMessages.onWelcome.0不存在,请检查配置文件是否正确')
            return
        }

        newUser = newUser.replace('(userName)',user)
        await danmu.sendChat(config.get('bilibiliInfo.roomId'),newUser)
        return
    }

    //如果该观众之前加入过,则按照规则进行处理
    const list = config.get('autoMessages.onWelcome')
    const timeSinceLastJoin = Math.round(Date.now()/1000) - lastJoinTime

    const ordered = Object.keys(list).sort().reduce(//对列表中的键值对进行排序
        (obj, key) => {
            obj[key] = list[key];
            return obj;
        },
        {}
    );

    const table = Object.keys(ordered)
    for(let i=0; i < table.length; i ++){
        if (table[i+1] > timeSinceLastJoin && table[i + 1] !== undefined && table[i] <= timeSinceLastJoin ){
            let preText = ordered[table[i]]
            preText = preText.replace('(userName)',user)
            await danmu.sendChat(config.get('bilibiliInfo.roomId'),preText)
            return
        }
    }
    logger.debug(`自定义欢迎内容获取失败,无法在配置项中找到比时间差:${timeSinceLastJoin}大的配置项,该用户可能太久没加入了`)

}




const sendNewGuardThanks  = async (user,guardLevel) => {
    if(config.get('configInfo.enableNewGuardThanks') !== true){//若configInfo.enableNewGuardThanks未开启,则不感谢新舰长
        return
    }

    if (config.get('autoMessages.onNewGuard').length < 1){//检查配置文件合法性
        logger.debug('配置文件autoMessages.onNewGuard中不存在任何配置项,运行被取消')
        return
    }
    let pretext = config.get(`autoMessages.onNewGuard.${guardLevel}`)
    if (pretext === undefined || pretext === ''){ //如果未获取到任何文本,或获取的文本为空则直接拒绝执行
        logger.debug(`在当前舰长等级下未找到任何匹配的感谢语句,请检查配置文件,被输入的舰长等级${guardLevel}`)
        return
    }
    pretext = pretext.replace('(userName)',user)
    await danmu.sendChat(config.get('bilibiliInfo.roomId'),pretext)
}

const sendSuperChatThanks = async (user,price) => {//处理醒目留言感谢消息的发送
    if (config.get('configInfo.enableSuperChatThanks') !== true){
        return
    }
    if (config.get('autoMessages.onSuperChat').length < 1){//检查配置文件合法性
        logger.debug('配置文件autoMessages.onGiftSend中不存在任何配置项,运行被取消')
        return
    }

    const list = config.get('autoMessages.onSuperChat')
    const ordered = Object.keys(list).sort().reduce(//对列表中的键值对进行排序
        (obj, key) => {
            obj[key] = list[key];
            return obj;
        },
        {}
    );

    const table = Object.keys(ordered)
    for(let i=0; i < table.length; i ++){
        if (table[i+1] > price && table[i + 1] !== undefined && table[i] <= price ){
            let preText = ordered[table[i]]
            preText = preText.replace('(userName)',user)
            await danmu.sendChat(config.get('bilibiliInfo.roomId'),preText)
            return
        }
    }
    logger.debug(`醒目留言感谢内容获取失败,并未在Json中找到比${price}还大的配置项,请确认配置文件的正确性`)
    //优化：翻转sort结果并输出最后一个值比输入值小的最大结果
}





const sendGiftThanks = async (user,giftName,giftCount,giftPrice) => {//处理礼物感谢消息发送
    if(config.get('configInfo.enableGiftThanks') !== true){
        logger.debug('收到礼物,但礼物感谢开关为关闭状态,取消弹幕发送')
        return
    }
    if (config.get('autoMessages.onGiftSend').length < 1){//检查配置文件合法性
        logger.debug('配置文件autoMessages.onGiftSend中不存在任何配置项,运行被取消')
        return
    }
    if (giftPrice < 10){//若礼物小于10元，则直接算做免费礼物
        await danmu.sendChat(config.get('bilibiliInfo.roomId'),config.get(`autoMessages.onGiftSend.0`,))
        logger.debug('收到免费礼物,已发送弹幕感谢') //在发送后取消继续检查
        return
    }

    const list = config.get('autoMessages.onGiftSend')
    const ordered = Object.keys(list).sort().reduce(//对列表中的键值对进行排序
        (obj, key) => {
            obj[key] = list[key];
            return obj;
        },
        {}
    );

    const table = Object.keys(ordered)
    for(let i=0; i < table.length; i ++){
        if (table[i+1] > giftPrice && table[i + 1] !== undefined && table[i] <= giftPrice ){
            let preText = ordered[table[i]]
            preText = preText.replace('(userName)',user)
            preText = preText.replace('(giftName)',giftName)
            preText = preText.replace('(giftCount)',giftCount)
            await danmu.sendChat(config.get('bilibiliInfo.roomId'),preText)
            return
        }
    }
    logger.debug(`礼物感谢内容获取失败,并未在Json中找到比${giftPrice}还大的配置项,请确认配置文件的正确性`)
    //优化：翻转sort结果并输出最后一个值比输入值小的最大结果
}


const aiChatReplyCheck = async (uid, msg) => {//检查AI回复的各项事务并进行针对处理
    if (msg.substring(0, 1) !== triggerPrefix) {
        return
    }//若不能匹配到触发字符，则取消执行
    if (allowAiReply === false) {
        return
    }//若AI回复功能主开关为关闭状态，则取消执行
    switch (msg.substring(1)) {
        case'个人信息':
            //预留
            break
        //将来的智能命令预留

        default://默认为AI聊天功能
            if (enableAiChat === false) {
                return
            }//检查是否启用AI聊天
            await aiReply.replyChat(liveRoom, uid, msg.substring(1))//发送回答
            break
    }

}





module.exports = {
    danmuJob,
    giftJob,
    sendOnLiveMessage,
    sendGiftThanks,
    sendNewGuardThanks,
    sendSuperChatThanks,
    sendWelcomeMessage,
    sendFollowThanks
}
