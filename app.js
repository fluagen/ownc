var path = require('path');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var compress = require('compression');
var RedisStore = require('connect-redis')(session);
var Loader = require('loader');
var _ = require('lodash');
var sassMiddleware = require('node-sass-middleware');


var app = express();

var config = require('./config');
var webRouter = require('./web_router');
var auth = require('./middleware/auth');
var notice = require('./middleware/notice');
var tab = require('./middleware/tab');



// 配置环境
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));

// 静态文件目录
var staticDir = path.join(__dirname, 'public');
app.use('/public', express.static(staticDir));

//通用中间件
app.use(bodyParser.json({
    limit: '1mb'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '1mb'
}));
app.use(require('method-override')());
app.use(require('cookie-parser')(config.session_secret));
app.use(compress());
app.use(session({
    secret: config.session_secret,
    store: new RedisStore({
        port: config.redis_port,
        host: config.redis_host,
    }),
    resave: true,
    saveUninitialized: true,
}));

//自定义中间件
app.use(notice.alertMessage);
app.use(auth.authUser);


var assets = {};
// 设置全局变量
_.extend(app.locals, {
    config: config,
    Loader: Loader,
    assets: assets,
    _: _
});
_.extend(app.locals, require('./common/render_helper'));

app.use(tab.init);

// routes
app.use('/', webRouter);

app.use(function(err, req, res, next) {
    console.error(err);
    return res.status(500).send('500 status');
});

app.listen(config.port, function() {
    console.log('Ownc listening on port', config.port);
});

module.exports = app;