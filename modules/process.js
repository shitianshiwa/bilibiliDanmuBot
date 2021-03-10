const aiReply = require ('./ai')
const config = require ('../utils/config')
const logger = require ('../utils/logger')


//=================读取配置项防止频繁的文件请求=========================
const allowAiReply = config.get('configInfo.enableAi')
const liveRoom = config.get ('bilibiliInfo.roomId')
const triggerPrefix = config.get ('configInfo.triggerPrefix')
const enableAiChat = config.get ('configInfo.enableAiFunction.enableAiChat')




const danmuJob = async (msg)=>{
    logger.danmu(msg.info[2][1],msg.info[1])
    await aiChatReplyCheck(msg.info[2][0],msg.info[1])
}


const giftJob = async (msg)=>{
//开发预留
    msg
}


const aiChatReplyCheck = async (uid,msg)=>{//检查AI回复的各项事务并进行针对处理
    if (msg.substring(0,1) !== triggerPrefix){ return }//若不能匹配到触发字符，则取消执行
    if (allowAiReply === false){return}//若AI回复功能主开关为关闭状态，则取消执行
    switch (msg.substring(1)){
        case'个人信息':
            //预留
        break

        default://默认为AI聊天功能
            if(enableAiChat === false){return}//检查是否启用AI聊天
            await aiReply.replyChat(liveRoom,uid,msg.substring(1))//发送回答
        break
        //将来的智能命令预留
    }

}


module.exports ={
    danmuJob,
    giftJob
}