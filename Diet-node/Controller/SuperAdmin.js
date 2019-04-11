const db = require('./private/DB.js');
const $ = require('./private/Public.js')
class SuperAdmin {
    /*-----------------超級管理員權限方法--------------------*/
    // 列出所有商店
    static async listShops(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let data = await db.query('select * from shop where is_del=0 order by id asc')
        if(data) return res.json({status:1,msg:'全部列出',data:data})
        else return res.json({status:0,msg:'列出失敗'})
    }
    // 新增商店
    static async addShops(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let title = trim(req.body.title) // 店鋪名
        let username = trim(req.body.username) // 用戶名
        let password = trim(req.body.password) // 密碼
        let email = trim(req.body.email) // 郵箱
        if(!title) return res.json({status:0,msg:'輸入店名！'})
        if(!username) return res.json({status:0,msg:'輸入店長用戶名！'})
        if(!password) return res.json({status:0,msg:'輸入密碼！'})
        if(!email) return res.json({status:0,msg:'輸入郵箱！'})

        // 驗證店鋪email是否重複
        let count = await db.query('select id from shop where email=?',[email])
        if(count.length>0) return res.json({status:0,msg:'郵箱存在，請更改'})

        // 插入店鋪
        let data = {
            title:title,
            email:email,
            time:Date.parse(new Date())/1000
        }
        let flag = await db.insert('shop',data)
        if(!flag) return res.json({status:0,msg:'新增店鋪失敗'})

        // 插入店長用戶
        data = {
            sid:flag,
            username:username,
            password:md5(password),
            token:'',
            pid:1,
            admin:0
        }
        flag = await db.insert('user',data)
        if(flag) return res.json({status:1,msg:'插入新店鋪和新用戶成功'})
        else return res.json({status:0,msg:'插入用戶失敗'})
    }
    static async delShops(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let id = parseInt(req.body.id)
        if(!id) return res.json({status:0,msg:'請輸入店鋪ID'})
        if(id==user.sid) return res.json({status:0,msg:'禁止刪除管理員'})
        let flag = (await db.query('update shop set is_del=1 where id=?',[id])).changedRows
        if(flag) return res.json({status:1,msg:'已刪除'})
        return res.json({status:0,msg:'刪除失敗'})
    }
    //支付,貨幣列表
    static async payList(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let data = await db.query('select * from payway where is_del=0')
        let data2 = await db.query('select * from currency where is_del=0')
        return res.json({status:1,msg:'全部列出',data:{payway:data,currency:data2}})
    }
    //添加支付方式
    static async payWayAdd(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let data = {
            title:req.body.title,
            title_en:req.body.title_en,
            createtime:(new Date()).getTime()/1000
        }
        let flag = await db.insert('payway',data)
        if(flag) return res.json({status:1,msg:'支付方式寫入成功！'})
        else return res.json({status:0,msg:'支付方式寫入失敗！'})
    }
    //刪除支付方式
    static async payWayDel(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let id = parseInt(req.body.id)
        if(!id) return res.json({status:0,msg:'請輸入支付方式ID'})
        let flag = (await db.query('update payway set is_del=1 where id=?',[id])).changedRows
        if(flag) return res.json({status:1,msg:'支付方式已刪除！'})
        else return res.json({status:0,msg:'支付方式刪除失敗！'})
    }
    // 添加貨幣
    static async currencyAdd(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let data = {
            title:req.body.title,
            unit:req.body.unit,
            title_en:req.body.title_en,
            createtime:(new Date()).getTime()/1000
        }
        let flag = await db.insert('currency',data)
        if(flag) return res.json({status:1,msg:'貨幣種類寫入成功！'})
        else return res.json({status:0,msg:'貨幣種類寫入失敗！'})
    }
    //刪除貨幣
    static async currencyDel(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!user.admin) return res.json({status:-1,msg:'滾開，你不是管理員，禁止一切惡意攻擊！'})
        let id = parseInt(req.body.id)
        if(!id) return res.json({status:0,msg:'請輸入貨幣ID'})
        let flag = (await db.query('update currency set is_del=1 where id=?',[id])).changedRows
        if(flag) return res.json({status:1,msg:'貨幣已刪除！'})
        else return res.json({status:0,msg:'貨幣刪除失敗！'})
    }
}
module.exports=SuperAdmin
