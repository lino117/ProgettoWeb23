var createError = require('http-errors');
const http = require('http')
var express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {expressjwt} = require('express-jwt');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require("body-parser");
var socialRouter = require('./routes/social');
const socketController = require('./controllers/socketController')
var app = express();
const server = http.createServer(app);
const mongoose = require("mongoose");
const {secretToken} = require("./middleware/authenticateToken");
// mongoose.connect("mongodb+srv://jinclaudio:Keqingyyds123.@claudiomongo.3ulb5gw.mongodb.net/ProgettoTecweb?retryWrites=true&w=majority");
mongoose.connect('mongodb://site222320:aiRaeWe2@mongo_site222320?writeConcern=majority');
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once('open', () => console.log("Db connesso"));
console.log("sono qui ")

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/social', socialRouter);

// app.use("/", express.static("public"));

app.use('/moderator/', express.static(path.join(__dirname, 'frontend/mod')));
app.use('/moderator',(req, res) => {
    res.sendFile(path.join(__dirname, "frontend/mod/index.html"))
});


// app.use('/smm', express.static('frontend/smm/build'))
// app.use("/smm/*", (req, res) => { res.sendFile(path.join(__dirname, "frontend/smm/build/index.html")) });
app.use('/', express.static(path.join(__dirname, 'frontend/app/dist')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "frontend/app/dist/index.html"))
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// const PORT = process.env.PORT || 3000;  // Usando la porta 8000 come esempio
// app.listen(PORT, () => {
//     console.log(`Server in ascolto sulla porta ${PORT}`);
// });
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
