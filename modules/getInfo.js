const got = require ('../utils/got')
const config = require ('../utils/config')
const logger = require ('../utils/logger')

const getOwnerInfo = async ()=>{
    logger.info('正在尝试获取直播间信息.....')
    const {body} = await got.get(`https://api.live.bilibili.com/room/v1/Room/get_info?id=${config.get('bilibiliInfo.roomId')}`,{
        responseType: "json"
    })
    console.log(body)
    if (body.code !== 0){
        logger.info('无法获取到直播间信息,原因有可能是网络不通或者该直播间不存在')
    } else{
        logger.info(`直播间${config.get('bilibiliInfo.roomId')}信息获取完毕!`)
        config.set('streamInfo.owner',body.data.uid)
        return body.data
    }
}


const getFollower = async ()=>{
    const {body} = await got.get(`https://api.bilibili.com/x/relation/followers?vmid=${config.get('streamInfo.owner')}&pn=1&ps=50&order=desc&order_type=attention&jsonp=jsonp`,{
        responseType: "json",
    })

    if (body.code !== 0){
        logger.info(`无法获取到主播新关注者信息,该接口可能被屏蔽,错误消息:${body.message}`)
    }else{
        return body
    }
}

module.exports = getNewFollower