import richdoc, { Delta } from 'richdoc';
import records from './helper/records';
import BC from '../common/utils/broadcast';
import { assign } from '../common/utils/lang';
// import socketTools from '../app/socket_tools';


const initState = {
  status: 'sended',

  submittedCS: new Delta(),  // changes have been submitted
  committingCS: new Delta(), // changes have submitted to server but not have heard ACK
  userCS: new Delta(),       // changes have not yet submitted to server
  applyCS: null,             // changes should be applied to doc
  fromPush: false            // whether from server push
};

function receivedInitSheet(state, submittedCS, revision) {
  records.clear();
  return _updateState(state, {
    status: 'sended',
    submittedCS: submittedCS,
    committingCS: new Delta(),
    userCS: new Delta(),
    applyCS: null,
    fromPush: false,
    revision: revision
  });
}

function composeUserChange(state, newChange, disableRecords){
  if(!disableRecords){
    var doc, invertedChange;
    doc = state.submittedCS
            .compose(state.committingCS)
            .compose(state.userCS);

    // invert报错会使用户无法保存数据，且没有任何提示
    // 所以修改为try catch
    try {
      invertedChange = doc.invert(newChange);
    } catch (error) {

      // 弹窗提醒用户手动保存
      BC.notify('accept:error', 'invert error');

      // 将错误信息发送到日志
      trackError({
        submittedCS: richdoc.pack(state.submittedCS),
        committingCS: richdoc.pack(state.committingCS),
        userCS: richdoc.pack(state.userCS),
        newChange: richdoc.pack(newChange),
        baseRev: state.revision,
        guid: window.cow.currentFile.guid
      }, 'reducer/msg.js', 0, 0, {name: 'changeset invert error', errorString: error.toString()});
    }

    records.record(invertedChange);
  }

  return _updateState(state, {
    userCS: state.userCS.compose(newChange)
  });
  
}

function sendChange(state){
  console.dir(state.userCS);
  var tempDoc, msg;
  tempDoc = state.submittedCS.compose(state.userCS);

  if(!tempDoc.isDocument){
    console.dir(tempDoc.ops);
    alert('文档出错，请刷新重试！');
    return state;
  }

  msg = {
    type: "COLLABROOM",
    component: "pad",
    padId: window.cow.currentSheetGuid,
    data: {
      type: 'USER_CHANGES',
      baseRev: state.revision,
      changeset: richdoc.pack(state.userCS)
    }
  };

  // socketTools.send('message', msg);
  return _updateState(state, {
    status: 'sending',
    committingCS: state.userCS,
    userCS: new Delta()
  });
}

function sendChangeSuccess(state, revision){
  return _updateState(state, {
    status: 'sended',
    submittedCS: state.submittedCS.compose(state.committingCS),
    committingCS: new Delta(),
    revision: revision
  });
}

function receivedNewChange(state, newChange, revision){
  var cs;
  newChange = richdoc.unpack(newChange);
  cs = _processRemoteNewChange(state, newChange);

  return _updateState(state, {
    revision: revision,
    submittedCS: cs._a,
    committingCS: cs. _x,
    userCS: cs._y,
    applyCS: cs.d,
    fromPush: true   //区分来自server push和自己undo, redo产生的applyCS
  });
}

/**
 * 点击undo, redo按钮出发的change处理
 * @param  {[type]} state     [description]
 * @param  {[type]} newChange [description]
 * @return {[type]}           [description]
 */
function undoRedoChange(state, newChange){
  var cs = _processRemoteNewChange(state, newChange),
    _userCS;
  _userCS = cs._y.compose(cs.d); //update userCS for submitting

  return _updateState(state, {
    submittedCS: cs._a,
    committingCS: cs._x,
    userCS: _userCS,
    applyCS: cs.d,
    fromPush: false
  });
}

function _processRemoteNewChange(state, newChange){
  var userCS, committingCS, submittedCS, tempT,
    _a, _x, _y, d;

  userCS = state.userCS;
  committingCS = state.committingCS;
  submittedCS = state.submittedCS;
  tempT = committingCS.transform(newChange);
  _a = submittedCS.compose(newChange);
  _x = newChange.transform(committingCS);
  _y = tempT.transform(userCS);
  d = userCS.transform(tempT);

  return {
    _a: _a,
    _x: _x,
    _y: _y,
    d: d
  };
}


function performUndo(state){
  var _undoTask, doc, _redoTask;
  _undoTask = records.popUndo();
  
  window.cow.sheetAction.push({action: 'undo', task: _undoTask});
  if(_undoTask){
    doc = state.submittedCS
            .compose(state.committingCS)
            .compose(state.userCS);
    _redoTask = doc.invert(_undoTask);
    records.pushRedo(_redoTask);
  } else {
    return state;
  }

  return _updateState(state, {
    userCS: _undoTask,
    applyCS: _undoTask,
    fromPush: false
  });
}

function performRedo(state){
  var _undoTask, doc, _redoTask;
  _redoTask = records.popRedo();

  window.cow.sheetAction.push({action: 'redo', task: _redoTask});
  if(_redoTask){
    doc = state.submittedCS
            .compose(state.committingCS)
            .compose(state.userCS);
    _undoTask = doc.invert(_redoTask);
    records.record(_undoTask);
  } else {
    return state;
  }

  return _updateState(state, {
    userCS: _redoTask,
    applyCS: _redoTask,
    fromPush: false
  });
}


module.exports = function msg(state, action){
  state = state || initState;

  switch(action.type){
    case 'SPREADSHEET_LOAD_SUCCESS':
      const unpacked = richdoc.unpack(action.result);
      return receivedInitSheet(state, unpacked, action.revision);

    case 'COMPOSE_USER_CHANGES':
      return composeUserChange(state, action.newChange, action.disableRecords);

    case 'SEND_CHANGE':
      BC.notify('saveStatus:start');
      return sendChange(state);

    case 'SEND_CHANGE_SUCCESS':
      BC.notify('saveStatus:success');
      return sendChangeSuccess(state, action.revision);

    case 'NEW_CHANGE_FROM_SERVER':
      BC.notify('saveStatus:getUpdate');
      return receivedNewChange(state, action.newChange, action.revision);

    case 'UNDO':
      return performUndo(state);

    case 'REDO':
      return performRedo(state);

    case 'UNDO_REDO_CHANGE':
      return undoRedoChange(state, action.newChange);
  }
  return state;
}

function _updateState(preState, state){
  return assign({}, preState, state);
}
