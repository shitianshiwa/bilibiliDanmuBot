const got = require('../utils/got')
const danmu = require('./biliapi')
const logger = require('../utils/logger')

const askAi = async (sender, message)=>{
    let body = await got.get(`https://tbp.cloud.tencent.com/chatflow/demoQuery?Action=TextProcess&AgentId=vqwd4BbLH%2Bc4J%2BOoqCOgt7qCz6PEcFpNq%2F9p5%2BIH09vhwmGXCiGX1Ro8kireVtL9ZlFTAMP%2Fk%2BZ%2Bz9ZnZrcl6fS7QFNKJ2pd84w1oSa6fuQ%3D&SessionId=${sender}&QueryText=${message}`).json()
    logger.debug(body.Response.ResponseMessage.GroupList[0].Content)
    return {ResponseText: body.Response.ResponseMessage.GroupList[0].Content}
}

const replyChat = async (room, uid, message) => {

    let result = await askAi(uid, message)
    if (result.ResponseText.length > 30) {//若AI给的答案超出长度
        logger.debug(`AI给出的答案超出了限制长度,调用默认回答`)//可以分片发送，但因为有可能出现超长回复，防止刷屏所以关闭
        await danmu.sendChat(room, '我没明白你的问题....')
        return
    }
    await danmu.sendChat(room, result.ResponseText)
}

module.exports = {
    replyChat,
    askAi
}
