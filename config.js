/**
 * Created by zppro on 15-5-8.
 */
'use strict';

module.exports = function (app){
    app.config = {
        //mssql数据库配置
        // db : {
        //    user: 'dbo',
        //    password: '109,dbo@2015',
        //    server: '115.236.175.109',
        //    port:'10016',
        //    database: 'Leblue-Configuration'
        //};
        db: {
            user: '数据库用户',
            password: '密码',
            server: '服务器IP',
            port:'服务器端口',
            database: '数据库名'
        },
        secure:{
            authSecret:'leblue'
        }
    };

    process.argv.forEach(function(v,i,arr){
        var arr = v.split('=');
        if(arr.length > 1 && arr[1].length >0){
            //if(app.config.db[arr[0]]){
            //    app.config.db[arr[0]] = arr[1];
            //}
            for(var k in app.config){
                if(app.config[k][arr[0]]){
                    app.config[k][arr[0]] = arr[1];
                }
            }
        }

        //if(v.match(/debug/) && v.split('=').length == 1){
        //    debugFlag = true;
        //}
    });
};