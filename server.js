var express    = require('express');
var app        = express();
var path       = require('path');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');

// Database
mongoose.Promise = global.Promise;
// mongoose.connect(process.env.MONGO_DB, { useFindAndModify: false });
mongoose.connect('mongodb+srv://rito:rito15@sogong-9vclk.mongodb.net/test?retryWrites=true&w=majority',
    { useFindAndModify: false });
var db = mongoose.connection;

db.once('open', function () {
    console.log('DB connected!');
});

db.on('error', function (err) {
    console.log('DB ERROR:', err);
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) { //1
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'content-type');
    next();
});

// API
// http://localhost:3000/ 요청에 연결되는 API
app.use('/', require('./api/root_api'));

// http://localhost:3000/user
app.use('/user', require('./api/user_api'));

// http://localhost:3000/category
app.use('/category', require('./api/category_api'));

// http://localhost:3000/event
app.use('/event', require('./api/event_api'));

// http://localhost:3000/plan
// app.use('/plan', require('./api/plan_api'));

// Server
var port = 3000;
var host = 'localhost';
app.listen(port, host, function(){
    console.log('listening on port:' + port);
});
