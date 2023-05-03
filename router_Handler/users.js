const connect = require('../database/mongodb')
        //
        // linkdb = async ()=>{
        //         const db =connect();
        //         const collection = db.collection('users')
        //         return collection
        // }

        checkUser = async (requsername)=>{
                try {
                        const db = await connect();
                        const collection = db.collection('users');
                        const result = await collection.find({username : requsername}).toArray();
                        console.log(result)
                        return (result.length == 0 ? true : false)
                }   catch (e) {
                        console.log(e)
                }
        }

         checkpsw = async (psw)=> {
                 try {
                         const db = await connect();
                         const collection = db.collection('users');
                         const result =  collection.findOne({password : psw});
                         collection.close
                         return (result.size != 0 ? result : undefined)
                 }catch (err){
                        console.log(err);
                }
        }

exports.regUser = async (req,res)=>{
        const userinfo = req.body
        if(!userinfo.username || !userinfo.password){
                return res.send( {status : 1, message:'Username o password non valido'} )
        }
        const noUser = await checkUser(userinfo.username)

        if (noUser) {
                try {
                        const db = await connect();
                        const collection = db.collection('users');
                        collection.insertOne({
                                username: userinfo.username,
                                password: userinfo.password,
                        })
                        collection.close;

                } catch (err) {
                        console.log(err)
                }
                res.send('Registrato!')
        }else {
                res.send('Username già esistente')
        }

}
// exports.search = async (req,res)=>{
//         const userinfo = req.body
//         try {
//                 const db = await connect();
//                 const collection = db.collection('users');
//                 const result = await collection.find({
//                          username:userinfo.username,
//                          // password:userinfo.password
//                 }).toArray();
//                 const NoUser=
//                 res.send(result != [] ? result : 'Username o password errato, riprova oppure registra' )
//                 // collection.close
//                 // console.log(result)
//                 // res.json(result)
//
//         } catch (err) {
//                 console.error(err)
//         }
//
//
// }

exports.login = async (req,res)=>{
        const userinfo = req.body
        try {
                const db = await connect();
                const collection = db.collection('users');
                const result = await collection.find({
                       username:userinfo.username,
                       password:userinfo.password
                }).toArray();
                collection.find().close()
                res.send((result.length == 0 ?  'Username o password errato, riprova oppure registra':result ))

        } catch (err) {
                console.error(err)
        }

}
exports.resetpsw= async (req,res)=>{
        const userinfo = req.body

        if (userinfo.userphase){
                const noUser = await checkUser(userinfo.username);
               res.send(noUser ? 'Username inesistente' : userinfo.username)
                // ricorda di mettere con bottone flag !userphase
        }else{
                try{
                        const db = await connect();
                        const collection = db.collection('users');
                        // collection.findOneAndReplace({username:userinfo.username},{#})
                        collection.findOneAndReplace({username:userinfo.username},{$set:{password:userinfo.newpsw}})

                        collection.close

                }catch (err){
                        console.log(err)
                }
        }

}