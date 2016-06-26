var richdoc = require('richdoc');

module.exports = function remoteActionMiddleware(){
  return function(store){
    return function(next){
      return function(action){
        if(action.meta && action.meta.remote){
          var newChange = store.getState().msg.userCS;
          newChange = richdoc.pack(newChange);
          window.socket && window.socket.emit('message', {change: newChange});
        }
        return next(action);
      }
    }
  }
};
