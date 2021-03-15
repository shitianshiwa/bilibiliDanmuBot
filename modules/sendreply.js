const config = require('../utils/config')
const logger = require('../utils/logger')
const danmu = require('./biliapi')
const randNumber = require ('../utils/random')

//=================读取配置项防止频繁的文件请求=========================
const liveRoom = config.get('bilibiliInfo.roomId')
const enableAutoWelcome = config.get('configInfo.enableAutoWelcome')
const enableGiftThanks = config.get('configInfo.enableGiftThanks')
const enableFollowThanks = config.get('configInfo.enableFollowThanks')
const enableSuperChatThanks = config.get ('configInfo.enableSuperChatThanks')
const enableNewGuardThanks = config.get ('configInfo.enableNewGuardThanks')


const sendFollowThanks = async (user) => {//发送对于新观众的感谢消息
    if(enableFollowThanks !== true){
        return
    }
    let choice = await randNumber.getNumber(1,config.get('autoMessages.onNewFollower').length)
    let pretext = config.get(`autoMessages.onNewFollower.${choice - 1}`,)
    pretext = pretext.replace('(userName)',user)
    await danmu.sendChat(config.get('bilibiliInfo.roomId'),pretext)
}


const sendOnLiveMessage = async () => {//若 configInfo.enableAutoMessages 开启,则此方法被调用时将发送设定好的的自动化消息
    if(config.get('configInfo.enableAutoMessages') !== true){
        return
    }

    if(global.liveStatus !== 1){ //若直播状态不等于直播中
        return
    }
    let choice = await randNumber.getNumber(1,config.get('autoMessages.onLive').length)
    await danmu.sendChat(liveRoom,config.get(`autoMessages.onLive.${choice - 1}`,))
}


const sendWelcomeMessage = async (user,lastJoinTime) => {
    if( enableAutoWelcome !== true){//若configInfo.enableAutoWelcome未开启,则不欢迎加入的用户
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
        await danmu.sendChat(liveRoom,newUser)
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
            await danmu.sendChat(liveRoom,preText)
            return
        }
    }
    logger.debug(`自定义欢迎内容获取失败,无法在配置项中找到比时间差:${timeSinceLastJoin}大的配置项,该用户可能太久没加入了`)

}


const sendNewGuardThanks  = async (user,guardLevel) => {
    if(enableNewGuardThanks !== true){//若configInfo.enableNewGuardThanks未开启,则不感谢新舰长
        logger.debug('配置文件configInfo.enableNewGuardThanks未开启,运行被取消')
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
    await danmu.sendChat(liveRoom,pretext)
}

const sendSuperChatThanks = async (user,price) => {//处理醒目留言感谢消息的发送
    if (enableSuperChatThanks !== true){
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
            await danmu.sendChat(liveRoom,preText)
            return
        }
    }
    logger.debug(`醒目留言感谢内容获取失败,并未在Json中找到比${price}还大的配置项,请确认配置文件的正确性`)
    //优化：翻转sort结果并输出最后一个值比输入值小的最大结果
}


const sendGiftThanks = async (user,giftName,giftCount,giftPrice) => {//处理礼物感谢消息发送
    if(enableGiftThanks !== true){
        logger.debug('收到礼物,但礼物感谢开关为关闭状态,取消弹幕发送')
        return
    }
    if (config.get('autoMessages.onGiftSend').length < 1){//检查配置文件合法性
        logger.debug('配置文件autoMessages.onGiftSend中不存在任何配置项,运行被取消')
        return
    }
    if (giftPrice < 10){//若礼物小于10元，则直接算做免费礼物
        await danmu.sendChat(liveRoom,config.get(`autoMessages.onGiftSend.0`,))
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
            await danmu.sendChat(liveRoom,preText)
            return
        }
    }
    logger.debug(`礼物感谢内容获取失败,并未在Json中找到比${giftPrice}还大的配置项,请确认配置文件的正确性`)
    //优化：翻转sort结果并输出最后一个值比输入值小的最大结果
}


const sendOnLiveStart = async ()=>{
    let message = config.get('autoMessages.onLiveStart')
    if (message !== ''){
        await danmu.sendChat(config.get('bilibiliInfo.roomId'),message)
    }
}

const sendOnLiveEnd = async ()=>{
    let message = config.get('autoMessages.onLiveEnd')
    if (message !== ''){
        await danmu.sendChat(config.get('bilibiliInfo.roomId'),message)
    }
}

const sendOnAnchorLotStart = async () =>{
    if (config.get('autoMessages.onAnchorLotStart') === ''){
        logger.debug('天选抽奖开始的消息内容配置为空,取消发送')
        return
    }
    await danmu.sendChat(config.get('bilibiliInfo.roomId'),config.get('autoMessages.onAnchorLotStart'))
}

const sendOnAnchorLotEnd = async () =>{
    if (config.get('autoMessages.onAnchorLotEnd') === ''){
        logger.debug('天选抽奖结束的消息内容配置为空,取消发送')
        return
    }
    await danmu.sendChat(config.get('bilibiliInfo.roomId'),config.get('autoMessages.onAnchorLotEnd'))
}

const quickClip = async () =>{
    await danmu.sendSigelChat(liveRoom,'极速切片已启动,录像时长:一分钟')
}

const sendOnPkStart = async () =>{
    await danmu.sendChat(liveRoom,config.get('autoMessages.onPkStart'))
}

const sendOnPkPre = async (userName) => {
    let message = config.get('autoMessages.onPkPre')
    await danmu.sendChat(config.get('bilibiliInfo.roomId'),message.replace('(userName)',userName))
}

//发送大乱斗结束消息,Status为0时为输,为1时为胜利,为2为平局
const sendOnPkEnd = async (status,supporter) => {
    //若最佳支持者不存在,取消发送
    if (supporter === ''){return}
    //判断胜负状态
    switch (status){
        case 1:
            let winMessage = config.get('autoMessages.onPkEndWin')
            await danmu.sendChat(liveRoom,winMessage.replace('(userName)',supporter))
        break

        case 0:
            let lostMessage = config.get('autoMessages.onPkEndLost')
            await danmu.sendChat(liveRoom,lostMessage.replace('(userName)',supporter))
        break

        default:
            let drawMessage = config.get('autoMessages.onPkEndDraw')
            await danmu.sendChat(liveRoom,drawMessage.replace('(userName)',supporter))
        break
    }
}

module.exports = {
    sendFollowThanks,
    sendOnLiveMessage,
    sendWelcomeMessage,
    sendNewGuardThanks,
    sendSuperChatThanks,
    sendGiftThanks,
    sendOnLiveStart,
    sendOnLiveEnd,
    sendOnAnchorLotStart,
    sendOnAnchorLotEnd,
    quickClip,
    sendOnPkPre,
    sendOnPkStart,
    sendOnPkEnd
}