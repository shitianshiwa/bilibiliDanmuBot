const crypto = require('crypto')
const got = require('../utils/got')
const sign = require('../utils/sign')
const logger = require('../utils/logger')
const config = require('../utils/config')
const fs = require('fs')

const getPublicKey = async () => {
    logger.info('正在尝试获取公钥....')

    let payload = {}

    const body = await got.post('https://passport.bilibili.com/api/oauth2/getKey', {
        form: sign(payload)
    }).json()
    if (body.code) {
        logger.info('公钥获取失败!')
    } else {
        logger.info('公钥获取成功!')
        return body.data
    }
}

const loginPassword = async () => {
    logger.info('正在尝试使用用户名密码登录....')
    let data = await getPublicKey()
    let username = config.get('bilibiliInfo.userName')
    let password = crypto.publicEncrypt(
        {
            key: data.key,
            padding: 1,
        },
        Buffer.from(`${data.hash}${config.get('bilibiliInfo.passWord')}`) // eslint-disable-line
    ).toString('base64')

    let payload = {
        seccode: '',
        validate: '',
        subid: 1,
        permission: 'ALL',
        username,
        password,
        captcha: '',
        challenge: '',
    }
    logger.info('尝试验证用户名密码....')
    const body = await got.post('https://passport.bilibili.com/api/v3/oauth2/login', {
        form: sign(payload),
    }).json()
    if (body.code || body.data.status) {
        logger.info('登录失败,用户名或密码可能错误')
        logger.debug(`登录失败,HTTP代码:${body.code},HTTP返回内容:${JSON.stringify(body)}`)
    } else {
        logger.info('登录成功完成!')
        logger.debug(`登录成功完成,HTTP返回内容:${JSON.stringify(body)}`)
        //写入到配置文件中
        config.set('bilibiliInfo.accessToken', body.data.token_info.access_token)
        config.set('bilibiliInfo.refreshToken', body.data.token_info.refresh_token)
        config.set('bilibiliInfo.uid', body.data.token_info.mid)
    }
}


const refreshToken = async () => {
    //检查配置文件中的refreshToken是否存在
    if (config.get('bilibiliInfo.refreshToken', '') === '') return false
    logger.info('正在刷新Access Token...')

    let payload = {
        access_token: config.get('bilibiliInfo.accessToken'),
        refresh_token: config.get('bilibiliInfo.refreshToken'),
    }

    const body = await got.post('https://passport.bilibili.com/api/oauth2/refreshToken', {
        form: sign(payload)
    }).json()

    if (body.code) {
        config.set('bilibiliInfo.accessToken', '')
        config.set('bilibiliInfo.refreshToken', '')
        logger.info('Access Token 刷新失败...')
        return false
    } else {
        config.set('bilibiliInfo.accessToken', body.data.access_token)
        config.set('bilibiliInfo.refreshToken', body.data.refresh_token)
        logger.info('Access Token 成功刷新!')
    }
}

const refreshCookie = async () => {
    logger.info('正在检查Cookie有效性....')
    const body = await getUserInfo()
    if (body.code !== "REPONSE_OK") {
        logger.info('Cookie 已过期,即将重新刷新.....')
        await got.get('https://passport.bilibili.com/api/login/sso', {
            searchParams: sign({}),
        })
        logger.info('Cookie 已完成刷新!')
        await getUserInfo()
    } else {
        logger.info('Cookie 仍旧有效,无需刷新!')
    }

}

const getUserInfo = async () => {
    const body = await got.get('https://api.live.bilibili.com/User/getUserInfo', {
        searchParams: {
            ts: Date.now()
        }
    }).json()
    // 获取UID
    if (body.code === 'REPONSE_OK') {
        config.set('bilibiliInfo.uid', body.data.uid)
    }
    return body
}

const resetEveryThing = async () => {
    config.set('bilibiliInfo.accessToken', '')
    config.set('bilibiliInfo.refreshToken', '')
    fs.unlink('./.cookie.json', err => {
        if (err) {
            logger.debug('删除文件失败,文件可能不存在或无法读写,路径:' + err.path)
        }
    })
}


module.exports = {
    loginPassword,
    refreshCookie,
    refreshToken,
    resetEveryThing
}
