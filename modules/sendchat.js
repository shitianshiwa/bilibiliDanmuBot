const got = require('../utils/got')
const cookie = require('../utils/cookie')
const logger = require('../utils/logger')

const sendChat = async (liveroom, message) => {
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
        //logger.debug(`弹幕消息发送成功,消息内容:${message}`) //成功了就不再打印,感觉头疼
        return {code: 0, message: '消息发送成功!'}
    }
}

const sendGift = async () => {
    //开发预留
}
module.exports = {
    sendChat,
    sendGift
}
