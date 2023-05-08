const connect = require('../database/mongodb')


        checkUser = async (requsername)=>{
                try {
                        const db = await connect();
                        const collection = db.collection('users');
                        const result = await collection.find({username : requsername}).toArray();
                        return (result.length === 0)
                }   catch (e) {
                        console.log(e)
                }
        }
exports.regUser = async (req,res)=>{
        const userinfo = req.body
        if(!userinfo.username || !userinfo.password){
                return res.send( {status : 1, message:'Username o password non valido'} )
        }
        const noUser = await checkUser(userinfo.username)

        // if (noUser) {
                try {
                        const db = await connect();
                        const collection = db.collection('users');
                        collection.insertOne({
                                username: userinfo.username,
                                password: userinfo.password,
                                usertype: userinfo.usertype,
                                CharNum: userinfo.CharNum
                        })

                } catch (err) {
                        console.log(err)
                }
                res.send('Registrato!')
        // }else {
        //         res.send('Username già esistente')
        // }

}
//参数是 username password
exports.login = async (req,res)=>{
        const userinfo = req.body
        try {
                const db = await connect();
                const collection = db.collection('users');
                const result = await collection.find({
                       username:userinfo.username,
                       password:userinfo.password
                }).toArray();

                res.send((result.length === 0 ?  'Username o password errato, riprova oppure registra':result ))

        } catch (err) {
                console.error(err)
        }

}
//参数是 username， newpsw
exports.resetpsw= async (req,res)=>{
        const userinfo = req.body

        if (userinfo.userphase === 1){
                const noUser = await checkUser(userinfo.username);
               res.send(noUser ? 'Username inesistente' : userinfo.username)
                // ricorda di mettere con bottone flag !userphase
        }else{
                try{
                        const db = await connect();
                        const collection = db.collection('users');
                        // collection.findOneAndReplace({username:userinfo.username},{#})

                        await collection.updateOne({username:userinfo.username},{$set:{password:userinfo.newpsw}})
                        const result = await collection.find({username:userinfo.username}).toArray()
                        res.send(result)

                }catch (err){
                        console.log(err)
                }
        }

}
// 参数是 username, text, like
exports.squeal=async (req,res)=>{
        const squealinfo = req.body
        try {
                const db = await connect();
                const squeals = await db.collection('squeals');
                const squeal = await squeals.insertOne({
                        user: squealinfo.username,
                        text:  squealinfo.text,
                        like: squealinfo.like
                })
                const users = await db.collection('users')
                const CharNum = await users.find( {username: squealinfo.username},({CharNum:1})).toArray()
                var RemainderChar = CharNum[0].CharNum - squealinfo.text.length
                await users.updateOne({username:squealinfo.username},{$set:{CharNum: RemainderChar}})
                res.send('squealed!')
                // res.redirect('/home')
        }catch (e) {
                console.log(e)
        }
}

exports.getUser=async (req,res)=>{
        const userinfo = req.body
        try{
                const db = await connect()
                const users = await db.collection('users')
                const result = await users.find({})
                res.send(result)

        }catch (e) {
                console.log(e)
        }
}
