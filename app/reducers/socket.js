var socketTools = require('../app/socket_tools');

var initState = {
  connection: false,
  saveStatus: '',
};

function setConnectionState(state, connected){
  return _updateState(state, {
    connection: connected
  });
}

function _updateState(preState, state){
  return _.assign({}, preState, state);
}


module.exports = function(state, action){
  state = state || initState;
  switch(action.type){
    case 'SET_CONNECTION_STATE':
      return setConnectionState(state, action.connected);
  }
  return state;
};


