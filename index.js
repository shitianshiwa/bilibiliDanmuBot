const timer = require ('./modules/cornJob')
const auth = require ('./modules/auth')
const live = require ('./modules/danmuInfo')
const getInfo = require ('./modules/getInfo')

main()

async function main(){
    timer.getVideoInfo();
    timer.getNewCookie();
    await auth.resetEveryThing();
    await auth.loginPassword();
    await auth.refreshToken();
    await auth.refreshCookie();
    await getInfo.getOwnerInfo();
    live.connect();
}