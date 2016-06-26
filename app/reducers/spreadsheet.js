
var initState = {
  loaded: false,
  data: null
}

module.exports = function spreadsheet(state, action){
  state = state || initState;
  switch(action.type){
    case 'SPREADSHEET_LOAD':
      return _updateState(state, {
        loading: true,
        loaded: false
      });
    case 'SPREADSHEET_LOAD_SUCCESS':
      return _updateState(state, {
        loading: false,
        loaded: true,
        data: action.result
      });
    case 'SPREADSHEET_LOAD_FAIL':
      return _updateState(state, {
        loading: false,
        loaded: true,
        error: action.error
      });
  }
  return state;
}

function _updateState(preState, state){
  return _.assign({}, preState, state);
}

