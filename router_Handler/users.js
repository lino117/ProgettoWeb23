const connect = require('../database/mongodb')

// true if noUser
        noUser = async (username)=>{
                try {
                        const db = await connect();
                        const collection = await db.collection('users');
                        const result = await collection.find({username:username}).toArray();
                        return (result.length === 0)
                }   catch (e) {
                        console.log(e)
                }
        }

        timeCounter =async ()=>{
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed).toDateString();
                return today
        }

        popularityCheck = async (username)=>{
        try {
                var likeCont, dislikeCont;
                const db = await connect();
                const squeals = await db.collection('squeals')
                const likes = await squeals.find({username:username,popularity :{$in :['popolare','impopolare']}},{})

        }catch (e) {
                console.log(e)
        }
        }



// 参数是 username，password，usertype，Charnum,if usertype= professional
exports.regUser = async (req,res)=>{
        const userinfo = req.body

        if(!userinfo.username || !userinfo.password){
                return res.send( {status : 1, message:'Username o password non valido'} )
        }
        const noUser = await noUser(userinfo.username)

        // if (noUser) {
                try {
                        const db = await connect();
                        const collection = db.collection('users');
                        collection.insertOne({
                                username: userinfo.username,
                                password: userinfo.password,
                                usertype: userinfo.usertype,
                                CharNum : userinfo.CharNum,
                                SMM     : userinfo.smm,
                                popSqueals: 0,
                                umpopSqueals: 0,
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
                const noUser = await noUser(userinfo.username);
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
// 参数是 username, text, like, dislike,category,visitors
exports.squeal=async (req,res)=> {
        const squealinfo = req.body
        const today = timeCounter();


        const CM = squealinfo.visitors * 0.25
        let popularity = undefined
        // parte che distingue popolarita del messaggio
        if(squealinfo.like > CM && squealinfo.dislike > CM) {
                popularity = 'controverso'
        }else if (squealinfo.like > CM){
                popularity = 'popolare'
        }else if (squealinfo.dislike > CM){
                popularity = 'impopolare'
        }


        if ( await noUser(squealinfo.username) === false ) {
                try {
                        const db = await connect();
                        const squeals = await db.collection('squeals');
                        const squeal = await squeals.insertOne({
                                user    : squealinfo.username,
                                text    : squealinfo.text,
                                like    : squealinfo.like,
                                dislike : squealinfo.dislike,
                                category: squealinfo.category,
                                time    : today,
                                popularity : popularity,
                                CM : CM
                        })
                        // parte che modifica quota caratteri dopo squeal
                        const users = await db.collection('users')
                        const CharNum = await users.find({username: squealinfo.username}, ({CharNum: 1})).toArray()
                        var RemainderChar = CharNum[0].CharNum - squealinfo.text.length
                        await users.updateOne({username: squealinfo.username}, {$set: {CharNum: RemainderChar}})

                        res.send('squealed!')

                } catch (e) {
                        console.log(e)
                }
        }else{
                res.send('username inesistente')
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
exports.getSqueal = async (req,res)=>{
        try {
                const db = await connect();
                const squeals = await db.collection('squeals');
                const messages = await squeals.find({}).toArray();
                res.send(messages)

        }catch (e) {
                console.log(e)
        }
}
