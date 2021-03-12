const got = require('../utils/got')
const config = require('../utils/config')
const logger = require('../utils/logger')

const getOwnerInfo = async () => {
    logger.info('正在尝试获取直播间信息.....')
    const body = await got.get(`https://api.live.bilibili.com/room/v1/Room/get_info?id=${config.get('bilibiliInfo.roomId')}`).json()
    if (body.code !== 0) {
        logger.info('无法获取到直播间信息,错误消息:' + body.message)
        return {code: body.code, message: body.message}
    } else {
        logger.info(`直播间${config.get('bilibiliInfo.roomId')}信息获取完毕!`)
        // 直播短号转长号
        if (body.data.room_id !== config.get('bilibiliInfo.roomId')) config.set('bilibiliInfo.roomId', body.data.room_id)
        config.set('streamInfo.owner', body.data.uid)
        return body
    }
}

//根据提供的时间标记获取新的关注者
const getNewFollower = async (afterThisTime) => {
    const body = await got.get(`https://api.bilibili.com/x/relation/followers?vmid=${config.get('streamInfo.owner')}&pn=1&ps=50&order=desc&order_type=attention&jsonp=jsonp`).json()

    if (body.code !== 0) {
        logger.info(`无法获取到主播新关注者信息,错误消息:${body.message}`)
        return {code: body.code, message: body.message}
    } else {
        //在获取完成后返回
        const newFollower = []
        for (let i = 0; i < body.data.list.length; i++) {// NOTE: 循环遍历一页中所有的关注者
            if (body.data.list[i].mtime > afterThisTime) {
                newFollower.push(body.data.list[i]);
            }
        }
        return {code: body.code, data: newFollower}
    }
}


const getAllVideos = async (pageSize) => {  //优化:能否省略第一次的无用请求？复用第一次的请求结果?
    const body = await got.get(`https://api.bilibili.com/x/space/arc/search?mid=${config.get('streamInfo.owner')}&pn=1&ps=1&jsonp=jsonp`).json()
    if (body.code !== 0) {
        logger.info('获取投稿列表失败,错误信息:' + code.message)
        return {code: body.code, message: code.message}
    } else {
        logger.debug(`成功获取到首条视频信息,视频共计${body.data.page.count}个,当前在第${body.data.page.pn}页,分为${Math.ceil(body.data.page.count / pageSize)}页处理,每页上限${pageSize}条记录`)
        const result = []
        for (let splitCount = 1; splitCount < Math.ceil(body.data.page.count / pageSize) + 1; splitCount++) {//划分页面进行获取  +1是规避for判断式导致的缺页问题
            const part = await getVideoByOptions(splitCount, pageSize)
            if (part.code !== 0) {
                logger.info('获取视频信息失败,此次列表可能不完整')
                logger.debug(`在获取视频列表时进行第${splitCount}页信息读取时失败,返回信息:${JSON.stringify(part)}`)
                return {code: part.code, message: part.message}//循环结束
            } else {
                for (let i = 0; i < part.data.list.vlist.length; i++) {//加入元素，循环笨了点，等待优化
                    result.push(part.data.list.vlist[i])
                }
            }
        }
        return {code: 0, message: '操作成功完成', data: result}
    }
}


const getVideoByOptions = async (pageNumber, pageSize) => {
    const body = await got.get(`https://api.bilibili.com/x/space/arc/search?mid=${config.get('streamInfo.owner')}&pn=${pageNumber}&ps=${pageSize}&jsonp=jsonp`).json()

    if (body.code !== 0) {
        logger.info('分页获取视频信息时出现错误,错误信息:' + body.message)
        logger.debug('分页获取视频信息时出现错误，错误信息:' + body.message + '，当前在第' + pageNumber + '页,错误代码:' + body.code)
        return {code: body.code, message: body.message}
    } else {
        logger.debug(`成功获取第${pageNumber}页!元素长度${body.data.list.vlist.length}!`)
        return body
    }


}
module.exports = {
    getAllVideos,
    getVideoByOptions,
    getNewFollower,
    getOwnerInfo
}
