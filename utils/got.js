const got = require('got')
const logger = require('./logger')
const config = require('./config')
const CookieFileStore = require('tough-cookie-file-store').FileCookieStore
const CookieJar = require('tough-cookie').CookieJar

const cookieJar = new CookieJar(new CookieFileStore('./.cookie.json'))



const _got = got.extend({
    headers: {
        'User-Agent': 'bili-universal/8470 CFNetwork/978.0.7 Darwin/18.5.0',
        'Accept': '*/*',
        'Accept-Language': 'zh-cn',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': `https://live.bilibili.com/${config.get('bilibiliInfo.roomId')}`

    },
    cookieJar,
    timeout:20000,
    hooks:{
        beforeRequest:[
            options => {
            logger.debug('Debug HTTP request Method:' + options.method + '  href:' + options.url)
            }
        ],
       afterResponse:[
           response => {
            logger.debug('Debug HTTP respond body length:'+ response.rawBody.length)
            return response
           }
       ]
    }
    }
)



module.exports = _got