//生成从minNum到maxNum的随机数
const getNumber = async (minNum,maxNum) => {
    return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
}

module.exports = {
    getNumber
}