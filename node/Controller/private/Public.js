const db = require('./DB.js');

class Public{
    // 驗證用戶登錄狀態，可傳入對象或者json字符串
    static async auth(user){
        try {
            if(typeof user !== 'object') user = JSON.parse(user)
            if(user.id && user.token && user.sid) {
                let data = await db.query('select * from user where id=? and token=? and sid=?', [user.id,user.token,user.sid])
                if(data.length>0) return data[0] // 用戶存在
                else return false
            } else return false
        } catch(e) {
            return false
            throw e
        }
    }
    // 输入标准UNIX时间戳需/1000
    static stamp2date (ns=(new Date()).getTime()/1000) {
        return new Date(parseInt(ns)*1000)
    }
    // 输出标准UNIX时间戳需/1000
    static date2stamp (date=new Date()) {
        return Date.parse(date) / 1000
    }
    // 传入date对象Date类型，格式String类型
    static formatDate (date, fmt) {
        let o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
        }
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        for (let k in o) if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        return fmt
    }
    // 传入开始时间戳和结束时间戳
    static getDaysBetween(start,end){
        let date=[]
        let startTime = this.stamp2date(start)
        let endTime = this.stamp2date(end)
        while((endTime.getTime()-startTime.getTime())>=0){
            let year = startTime.getFullYear()
            let month = (startTime.getMonth()+1).toString().length==1?"0"+(startTime.getMonth()+1).toString():(startTime.getMonth()+1).toString()
            let day = startTime.getDate().toString().length==1?"0"+startTime.getDate():startTime.getDate()
            date.push(year+"-"+month+"-"+day)
            startTime.setDate(startTime.getDate()+1)
        }
        return date
    }
    static random(minNum,maxNum){
        switch(arguments.length){
            case 1:return Math.random()*minNum+1
            case 2:return Math.random()*(maxNum-minNum+1)+minNum
            default:return 0 
        }
    }
    static checkEmail(email){
        if(!email) return false
        var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
        if(reg.test(email)){
            return email
        }else{
            return false
        }
    }
}
module.exports=Public
