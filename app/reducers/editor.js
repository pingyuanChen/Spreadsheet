var initState = {
  selectedCell: null,
  formulaEditorVal: null
}

module.exports = function editor(state, action){
  state = state || initState;
  switch(action.type){
    case 'UPDATE_SELECTED_CELL':
      return _updateState(state, {
        selectedCell: action.cell
      });

    case 'FORMULA_EDITOR_CHANGE':
      return _updateState(state, {
        formulaEditorVal: action.value
      });
  }
  return state;
}

function _updateState(preState, state){
  return _.assign({}, preState, state);
}