/**
 * Created by zppro on 15-5-4.
 */
'use strict';
var koa = require('koa');
var router = require('koa-router');
var koaBody = require('koa-body')();
var session = require('koa-session');
var statelessauth = require('koa-statelessauth');
var jwt = require('jsonwebtoken');
var config = require('./config.js');
var auth = require('./auth.js');



//console.log(config);

var app = koa();

// config
config(app);
console.dir(app.config);
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

// auth
app.use(statelessauth({
    validate: function (token) {
        //This should go to a DB etc to get your user based on token
        //token to user
        try{
            this.user = jwt.verify(token, app.config.secure.authSecret);

        }catch(e){
            this.status = 401;
        }

        return this.user;
    }},
    {
        ignorePaths: ["/auth"]
    }
));

app.use(router(app))
    .get('/', function *(next) {
        this.body = 'hello guest';
    })
    .post('/auth', koaBody, auth(app));


app.listen(3000);