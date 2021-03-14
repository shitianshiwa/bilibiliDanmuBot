const timer = require ('./modules/cornJob')
const auth = require ('./modules/auth')
const live = require ('./modules/danmuInfo')
const getInfo = require ('./modules/getInfo')
const logger = require ('./utils/logger')

main()

async function main(){

    const result = await auth.refreshCookie()
    if (result.code !== 0){
        //若刷新Cookie失败,则尝试重新登录后再次刷新
        let login = await auth.loginPassword()
        if (login.code !== 0){
            logger.info(login.message)
            return
        }

        let access= await auth.refreshToken()
        if (access.code!== 0){
            logger.info(access.message)
            return
        }

        let cookie= await auth.refreshCookie()
        if (cookie.code !== 0){
            logger.info(cookie.message)
            return
            //若再次刷新cookie仍旧失败,则取消执行
        }
    }
    //timer.getVideoInfo();
    //timer.getNewCookie();
    timer.sendOnLiveMessage()
    await getInfo.getOwnerInfo();
    live.connect();
}