/**
 * Created by zppro on 15-5-8.
 */
'use strict';
var sql = require('co-mssql');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

module.exports = function auth(app){
    return function * () {
        var connection = new sql.Connection(app.config.db);
        yield connection.connect();
        var sqlBuilder = new sql.Request(connection);
        var passwordHash = crypto.createHash('md5').update(this.request.body.Password).digest('hex');
        var sqlStr = 'select * from Pub_User where UserCode=\'' + this.request.body.UserCode + '\' and PasswordHash=\'' + passwordHash + '\'';

        var recordset = yield sqlBuilder.query(sqlStr);

        var user = {};
        if (recordset.length == 1) {
            var token = jwt.sign({userId: recordset[0].UserId, userName: recordset[0].UserName}, app.config.secure.authSecret);
            console.log('token:' + token);
            this.body = token;
        }
        else {
            this.body = 'UnAuthorized!';
            this.status = 401;
            return;
        }
    }
};