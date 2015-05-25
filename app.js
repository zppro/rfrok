/**
 * Created by zppro on 15-5-4.
 */
'use strict';

var _ = require('underscore');
var koa = require('koa');
var router = require('koa-router')();
var koaBody = require('koa-body')();
var statelessauth = require('koa-statelessauth');
var jwt = require('jsonwebtoken');
var config = require('rfcore').config;
var dataP = require('rfcore').dataP;
var auth = require('./lib/auth.js');
var bizGF001 = require('./biz/GF001.js');


//console.log(conf);

var app = koa();

app.conf = {
    biz:['GF001'],
    auth: {
        ignorePaths: ['/auth']
    },
    db: {
        //mssql数据库配置
        sqlserver: {
            user: '数据库用户',
            password: '密码',
            server: '服务器IP',
            port: '服务器端口',
            database: '数据库名'
        }
    },
    secure:{
        authSecret:'认证密钥'
    }
};
// conf
config(app.conf,process.argv);



// logger
//app.use(function *(next){
//    var start = new Date;
//    yield next;
//    var ms = new Date - start;
//    console.log('logger    %s %s - %s', this.method, this.url, ms);
//});

//Session
//app.keys = ['leblue'];
//app.use(session(app));






// dataP
dataP.init('./dataP',{items:app.conf.biz.concat()}).then(function(){
    // router
    router
        .get('/', function *(next) {
            this.body = 'hello guest';
            yield next;
        })
        .post('/auth', koaBody, auth(app));

    //设置data service 远程
    //var options = {getPath:'/data/get',setPath:'data/set',writePath:'data/write'};

    dataP.remote.init(router);
    app.conf.auth.ignorePaths.push(dataP.remote.settings.getPath);
    app.conf.auth.ignorePaths.push(dataP.remote.settings.setPath);
    app.conf.auth.ignorePaths.push(dataP.remote.settings.writePath);
    //.post('/GF001', koaBody, bizGF001(app));
    //require('./lib/koa-dataP.js')(router);

    if(app.conf.biz.length > 0){
        _.each(app.conf.biz,function(o){
            router.post('/'+o, koaBody, require('./biz/'+o+'.js')(app,dataP));
        });
    }
    app.use(router.routes())
        .use(router.allowedMethods());

    // auth
    app.use(statelessauth({
            validate: function (token) {
                //This should go to a DB etc to get your user based on token
                //token to user
                try{
                    this.user = jwt.verify(token, app.conf.secure.authSecret);

                }catch(e){
                    this.status = 401;
                }

                return this.user;
            }},
        {
            ignorePaths: _.union(app.conf.auth.ignorePaths,_.map(app.conf.biz,function(o){ return '/'+o;}))
        }
    ));

    // listen
    app.listen(3000);
});

