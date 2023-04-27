


exports.get =(req,res)=>{
        res.send('respond with a resource')
}
exports.regUser =(req,res)=>{
        const userinfo = req.body
        if(!userinfo.username || !userinfo.password){
                return res.send( {status : 1, message:'Username o password non valido'} )
        }
        res.send('Registrato!')
}
exports.login = (req,res)=>{
        res.send('Login con successo')
}