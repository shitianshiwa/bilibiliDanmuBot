const config = require('./utils/config')
const logger = require('./utils/logger')




//测试logger功能及界面
logger.debug('测试配置文件输入:数据库密码:'+config.get('databaseInfo.passWord'))
logger.danmu('OlderFox','弹幕外观测试')
logger.superChatMessage('OlderFox','醒目留言外观测试','30')
logger.roomRealTimeMessage(192,1464,64616)
logger.gift('OlderFox','礼物发送测试','Gold',3)
logger.anchorLotStart('天选之人奖励公告测试',1)
logger.guardBuy('OlderFox',3)
logger.guardBuy('OlderFox',2)
logger.guardBuy('OlderFox',1)
logger.guardBuy('OlderFox',0)
logger.connectToLiveRoom('error','olderFox',4911405)
logger.connectToLiveRoom('ok','olderFox',4911405)
