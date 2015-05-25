/**
 * Created by zppro on 15-5-13.
 */

var exec = require('child-process-promise').exec;
var log4js = require('log4js');

var bizName='GF001';

module.exports = function GF001(app,data){

    //日志
    log4js.configure({ appenders: [{
        type: 'dateFile',
        filename: 'logs/'+bizName,
        pattern: '-yyyy-MM-dd.log',
        alwaysIncludePattern: true,
        category: bizName
    }]});
    var logger = log4js.getLogger(bizName);

    //配置
    var kCallins = 'callins',kCallouts = 'callouts',kCallees = 'callees';
    var _callins = data.get(kCallins,bizName);
    var _callouts = data.get(kCallouts,bizName);
    var _callees =  data.get(kCallees,bizName);
    var needSave = false;
    if(!_callins){
        _callins = ['18668001381'];
        data.set(kCallins,_callins,bizName);
        needSave = true;
    }
    if(!_callouts){
        _callouts = ['13757140245','18668161133'];
        data.set(kCallouts,_callouts,bizName);
        needSave = true;
    }
    if(!_callees){
        _callees = ['86723691'];
        data.set(kCallees,_callees,bizName);
        needSave = true;
    }

    if(needSave){
        data.save(bizName).then(function(cont,success){
            if(!success){
                throw new Error('save '+bizName+'.json error');
            }
        });
    }

    return function * (next) {
        ///body {"caller":"主叫号码","callee":"被叫号码"}
        if(_callees.indexOf(this.request.body.callee) !== -1){
            logger.info(JSON.stringify(this.request.body));
            //检测主叫号码
            if(_callins.indexOf(this.request.body.caller) === -1){
                //非法的呼入码号
                logger.error(JSON.stringify('非法的呼入码号'+this.request.body.caller));
                this.body = '非法的呼入码号'+this.request.body.caller;
                return;
            }
            var self = this;
            var commandT = '/usr/local/atstar/voicestar/bin/fs_cli -x \'luarun '+bizName+'.lua [callNo] [wav] [times]\'';
            _callouts.forEach(function(v){
                var strCommand = commandT.replace('[callNo]',v).replace('[wav]',self.request.body.caller+'.wav').replace('[times]',2);
                //console.log(strCommand);
                exec(strCommand)
                    .then(function(result){
                        logger.info('请求外呼'+ v);
                    }).fail(function (err) {
                        logger.error(JSON.stringify(err));
                    });
            });

            self.body = bizName;
            return;
        }
        else{
            this.body = 'invalid callee';
        }

        yield next;
    };
};