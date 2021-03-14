const got = require('../utils/got')
const config = require('../utils/config')
const logger = require('../utils/logger')
const cookie = require('../utils/cookie')


const sendImMessage = async (targetUid,message) => {

    let csrf = await cookie('http://bilibili.com', 'bili_jct')
    if (csrf.code !== 0) {
        logger.info('无法获取到Csrf信息,私信消息发送被取消')
        return
    }

    const payload = {
        'msg[sender_uid]':config.get('bilibiliInfo.uid'),
        'msg[receiver_id]':targetUid,
        'msg[msg_type]':1,
        'msg[receiver_type]':1,
        'msg[content]':message,
        'msg[timestamp]':Math.round(Date.now()/1000),
        'msg[dev_id]':'00835CE6-9EE8-4C18-AFDE-D3F23649D339',
        csrf_token: csrf.data,
        csrf: csrf.data
    }
    const body = await got.post('https://api.vc.bilibili.com/web_im/v1/web_im/send_msg',{
        form:payload,
        responseType:"json"
    }).json()

    if (body.code !== 0){
        logger.info(`私信消息发送失败,错误代码:${body.code},服务端错误消息:${body.message}`)
        logger.debug(body)
    }else {
        logger.debug(body)
    }
}



const sendChat = async (liveroom, message) => {
    let danmu = message.split('\r')
    logger.debug(`多行弹幕划分为${danmu.length}次发送`)
    for (let i = 0; i < danmu.length; i ++){
        await sendSigelChat(liveroom,danmu[i])
        await sleep(1500)//休眠1500毫秒后进行下一次循环
    }
}


const sleep = function (ms){//一个简易的休眠计时器
    return new Promise(resolve => setTimeout(resolve, ms))
}

const sendSigelChat = async (liveroom,message) => {
    let csrf = await cookie('http://bilibili.com', 'bili_jct')
    if (csrf.code !== 0) {
        logger.info('无法获取到Csrf信息,消息发送被取消')
        logger.debug(JSON.stringify(csrf))
        return
    }
    let payload = {
        color: 16777215,
        fontsize: 25,
        mode: 1,
        msg: message,
        rnd: Math.round(Date.now() / 1000),
        roomid: liveroom,
        csrf_token: csrf.data,
        csrf: csrf.data
    }
    const body = await got.post('https://api.live.bilibili.com/msg/send', {
        form: payload,
    }).json()

    if (body.code !== 0) {
        logger.debug(`消息发送失败,错误原因[${body.message}]  消息内容[${message}]`)
        return {code: -1, message: body.message}
    } else {
        return {code: 0, message: '消息发送成功!'}
    }
}


const sendGift = async () => {
    //开发预留
}
module.exports = {
    sendChat,
    sendGift,
    sendImMessage,
    sendSigelChat
}