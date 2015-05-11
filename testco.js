/**
 * Created by zppro on 15-5-7.
 */
var co = require('co');

co(function* () {
    return yield Promise.resolve(false);
}).then(function (val) {
    console.log(val);
}, function (err) {
    console.error(err.stack);
});

var fn = co.wrap(function* (val) {
    return yield Promise.resolve(val);
});

fn('test').then(function (val) {
    console.log(val);
});