
var initState = {
  fontSize: '',
  color: '',
  background: '',
  align: '',
  vertical: '',

  boldSelected: false,
  italicSelected: false,
  underlineSelected: false,
  strikethroughSelected: false
};


module.exports = function (state, action){
  state = state || initState;
  switch(action.type){
    case 'SET_MENU_SELECTION':
      return _updateState(state, action.selection);
  }
  return state;
}

function _updateState(preState, state){
  return _.assign({}, preState, state);
}

