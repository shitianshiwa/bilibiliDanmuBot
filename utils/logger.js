const color = require('colors')
const config = require('./config')

module.exports = {

    danmu(sender, message) {
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + color.green(sender) + ':' + color.magenta(message));
    },
    gift(sender, giftName, coinType, giftNumbers) {
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + color.magenta(sender) + '赠送了' + color.red(giftNumbers) + '个' + color.yellow(giftName));
    },
    superChatMessage(sender, message, price) {
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '发送者' + color.red(sender) + '内容:' + color.red(message) + '醒目留言价值' + color.yellow(price) + '元');
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '发送者' + color.red(sender) + '内容:' + color.red(message) + '醒目留言价值' + color.yellow(price) + '元');
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '发送者' + color.red(sender) + '内容:' + color.red(message) + '醒目留言价值' + color.yellow(price) + '元');
    },
    roomRealTimeMessage(fans, fans_club, online) {
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '被动信息更新:粉丝数' + color.green(fans) + ',粉丝团成员数' + color.red(fans_club) + '当前房间人气' + color.yellow(online));
    },
    anchorLotStart(award, award_number) {
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '天选抽奖开始，奖励' + color.green(award) + '数量' + color.red(award_number));
    },
    debug(message) {
        if (config.get('configInfo.debug')) {
            console.log('[' + color.bold(color.red('DEBUG')) + ']' + color.yellow(message));
        }
    },
    guardBuy(username, guardLevel) {
        switch (guardLevel) {
            case 1:
                console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '用户' + color.green(username) + '购买了' + color.red('总督'));
                break
            case 2:
                console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '用户' + color.green(username) + '购买了' + color.yellow('提督'));
                break
            case 3:
                console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '用户' + color.green(username) + '购买了' + color.green('舰长'));
                break
            default:
                console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + '用户' + color.green(username) + '购买了' + color.magenta('不知道是什么玩意儿'));
                break
        }
    },
    connectToLiveRoom(status, roomId, owner) {
        if (status === 'ok') {
            console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + color.magenta('连接到直播间 ') + color.yellow(roomId) + color.green(' 成功!') + color.magenta(' 归属用户编号:') + color.yellow(owner));
        } else {
            console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + color.magenta('连接到直播间 ') + color.yellow(roomId) + color.red(' 失败!') + color.magenta(' 归属用户编号:') + color.yellow(owner));
        }
    },
    info(message) {
        console.log('[' + color.red(new Date().toLocaleTimeString()) + ']' + color.magenta(message));
    }
}
