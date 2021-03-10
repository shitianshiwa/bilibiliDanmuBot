const CookieFileStore = require('tough-cookie-file-store').FileCookieStore
const CookieJar = require('tough-cookie').CookieJar
const logger = require('./logger')
const hostName = require('url')

const getCookieByKey = async (url, key) => {
    const result = {}
    const cookie = new CookieJar(new CookieFileStore('./.cookie.json'))
    cookie.getCookies(url, (error, data) => {
        if (error) {
            logger.debug('Cookie查询失败,错误消息:' + error.message)
        }
        const list = cookie.toJSON(data)
        for (let i = 0; i < cookie.toJSON(data).cookies.length; i++) {
            if (list.cookies[i].key === key && list.cookies[i].domain === hostName.parse(url).hostname) {
                result.data = (list.cookies[i].value)//将cookie的值推入到结果中
                break //只要一个
            }
        }
    })
    //遍历完毕后检查是否找到结果
    if (result.data !== undefined) {
        //若存在内容
        return {code: 0, message: '操作成功完成', data: result.data}
    } else {
        return {code: -1, message: '未在cookie中找到任何结果'}
    }
}

module.exports = getCookieByKey
