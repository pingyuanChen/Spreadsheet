import { assign } from '../../common/utils/lang';

module.exports = function promiseMiddleware() {
  return function (next) {
    return function (action) {
      var promise = action.promise,
        types = action.types,
        rest = objectWithoutProperties(action, ['promise', 'types']);

      if(!promise){
        return next(action);
      }

      var request = types[0],
        success = types[1],
        fail = types[2];

      next(assign({}, rest, {type: request}));
      return promise
        .then(function(res){
          next(assign({}, rest, {
            type: success,
            result: res
          }));
          return res;
        }, function(err){
          next(assign({}, rest, {
            type: fail,
            error: err
          }));
          return err;
        });
    };
  };
};

function objectWithoutProperties(obj, keys){
  var target = {};
  for(var key in obj){
    if(keys.indexOf(key) < 0){
      target[key] = obj[key];
    }
  }
  return target;
}
