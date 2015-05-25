/**
 * Created by zppro on 15-5-21.
 */
var koaBody = require('koa-body')();

module.exports = function (router){
    router
        .get('/data/get', function *(next) {
            console.log(this.request.query.k);
            console.log(this.request.query.i);
            yield next;
        })
        .post('/data/set', koaBody,function *(next) {

            console.log(this.request.body.k);
            console.log(this.request.body.v);
            console.log(this.request.body.i);
            yield next;
        });
};