const config = require('./utils/config')
const logger = require('./utils/logger')
const auth = require('./modules/auth')
const cookie = require('./utils/cookie')
const getInfo = require('./modules/getInfo')
const streamListener = require('./modules/danmuInfo')
const danmu = require('./modules/sendchat')
const aiReply = require('./modules/ai')
//测试信息获取API
//test()
streamListener()

async function init() {
    //streamListener()
}


async function test() {
    const test = await aiReply.askAi('195909', '现在几点了')
    //const test = await danmu(1521498,'AuthSwitchRequestPacket')
    console.log(test)
}

//test()

//streamListener()
//测试公钥获取
//auth.refreshToken()
//auth.checkCookie()

//测试logger功能及界面
//logger.debug('测试配置文件输入:数据库密码:'+config.get('databaseInfo.passWord'))
//logger.danmu('OlderFox','弹幕外观测试')
//logger.superChatMessage('OlderFox','醒目留言外观测试','30')
//logger.roomRealTimeMessage(192,1464,64616)
//logger.gift('OlderFox','礼物发送测试','Gold',3)
//logger.anchorLotStart('天选之人奖励公告测试',1)
//logger.guardBuy('OlderFox',3)
//logger.guardBuy('OlderFox',2)
//logger.guardBuy('OlderFox',1)
//logger.guardBuy('OlderFox',0)
//logger.connectToLiveRoom('error','olderFox',4911405)
//logger.connectToLiveRoom('ok','olderFox',4911405)
