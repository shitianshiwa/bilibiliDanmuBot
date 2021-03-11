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
    }
}

module.exports = {
    sendImMessage
}