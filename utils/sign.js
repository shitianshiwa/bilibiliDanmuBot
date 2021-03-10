const logger = require('./logger')
const config = require('./config')
const qs = require('qs')
const md5 = require('md5')

const sign = data => {
    //appKey和Secret信息
    const appkey = 'aae92bc66f3edfab'
    const appsecret = 'af125a0d5279fd576c1b4418a3e8276d'
    //初始化默认信息
    const defaults = {
        access_key: config.get('bilibiliInfo.accessToken', ''),
        appkey,
        platform: 'pc',
        ts: Math.round(Date.now() / 1000),
    };
    //合并同类项，data覆盖defaults的相同项目
    data = {
        ...defaults,
        ...data
    }

    //hash = qs.

    let hash = qs.stringify(data, {sort: (a, b) => a.localeCompare(b)})

    hash = md5(hash + appsecret)

    data.sign = hash
    logger.debug(`File:sign.js-hash-output no.1 -data: ${hash}`)
    logger.debug(`File:sign.js-data-output no.1 -data: ${JSON.stringify(data)}`)
    return (data)
}

module.exports = sign
