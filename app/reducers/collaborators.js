var Cooperation  = require('cooperation');
var socketTools = require('../app/socket_tools');

var initState = {
  collaborators: {},
  updateCollab: false,
};

function sendSelectCell(state, cords){
  socketTools.send('message', {
    type: "COLLABROOM",
    padId: window.cow.currentSheetGuid,
    data: {
      type: 'SELECT',
      sheetId: window.cow.currentSheetId,
      range: cords  
    }
  });
  return state;
}

function sendUnselectCell(state){
  socketTools.send('message', {
    type: "COLLABROOM",
    padId: window.cow.currentSheetGuid,
    data: {
      type: 'UNSELECT',
      sheetId: window.cow.currentSheetId,
      range: cords  
    }
  });
  return state;
}

function recieveEnterCollaborator(state, collaborator){
  var _collaborators = _.cloneDeep(state.collaborators);
  collaborator.data.userInfo.color = Cooperation.getColor(collaborator.data.userInfo.id);
  if(!_collaborators[collaborator.data.sheetId]){
    _collaborators[collaborator.data.sheetId] = [];
  }
  _collaborators[collaborator.data.sheetId].push(collaborator);

  return _updateState(state, {
    collaborators: _collaborators
  });
}


function recieveLeaveCollaborator(state, collaborator){
  var _collaborators = _.cloneDeep(state.collaborators);
  _collaborators = _removeCollab(_collaborators, collaborator)

  return _updateState(state, {
    collaborators: _collaborators,
    updateCollab: true,
  });
}

function recieveCollaboratorSelected(state, collaborator){
  var _collaborators = _.cloneDeep(state.collaborators);
  _collaborators = _updateCollabs(_collaborators, collaborator);

  return _updateState(state, {
    collaborators: _collaborators,
    updateCollab: true
  });
}

function recieveCollaboratorUnselected(state, collaborator){
  var _collaborators = _.cloneDeep(state.collaborators);
  _collaborators = _updateCollabs(_collaborators, collaborator);

  return _updateState(state, {
    collaborators: _collaborators,
    updateCollab: true
  });
}

function updateCollabDone(state){
  return _updateState(state, {
    updateCollab: false
  });
}



module.exports = function msg(state, action){
  state = state || initState;

  switch(action.type){
    case 'SEND_SELECT_CELL':
      return sendSelectCell(state, action.cords);

    case 'SEND_UNSELECT_CELL':
      return sendUnselectCell(state);

    case 'RECIEVE_ENTER_COLLABORATOR':
      return recieveEnterCollaborator(state, action.collaborator);

    case 'RECIEVE_LEAVE_COLLABORATOR':
      return recieveLeaveCollaborator(state, action.collaborator);

    case 'RECEIVE_COLLABORATOR_SELECTED':
      return recieveCollaboratorSelected(state, action.collaborator);

    case 'RECEIVE_COLLABORATOR_UNSELECTED':
     return recieveCollaboratorUnselected(state, action.collaborator);

    case 'UPDATE_COLLAB_DONE':
      return updateCollabDone(state);
  }
  return state;
}

function _updateState(preState, state){
  return _.assign({}, preState, state);
}

function _removeCollab(collabs, newItem){
  var itemSheetId = newItem.data.sheetId,
    curCollabs;
  if(!collabs[itemSheetId]){
    collabs[itemSheetId] = [];
  }
  curCollabs = collabs[itemSheetId];

  _.remove(curCollabs, function(item){
    return item.data.userInfo.id == newItem.data.userInfo.id;
  });
  return collabs;
}

function _updateCollabs(collabs, newItem){
  var itemSheetId = newItem.data.sheetId,
    i=0, l=0, 
    curCollabs;

  if(!collabs[itemSheetId]){
    collabs[itemSheetId] = [];
  }
  curCollabs = collabs[itemSheetId];
  
  for(i=0,l=curCollabs.length; i<l; i++){
    if(newItem.data.userInfo.id == curCollabs[i].data.userInfo.id){
      curCollabs[i].data.range = newItem.data.range;
      break;
    }
  }
  if(i == l){
    newItem.data.userInfo.color = Cooperation.getColor(newItem.data.userInfo.id);
    curCollabs.push(newItem);
  }
  return collabs;
}

