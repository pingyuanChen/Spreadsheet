var stack = {
  undoStack: [],
  redoStack: [],
  undoableNum: 0,
  redoableNum: 0,

  record: function(newChange){
    this.undoStack.push(newChange);
    this.undoableNum += 1;
  },

  isUndoable: function(){
    return !!this.undoableNum;
  },

  isRedoable: function(){
    return !!this.redoableNum;
  },

  popUndo: function(){
    var task = this.undoStack.pop();
    this.undoableNum -= 1;
    return task;
  },

  /**
   * 当执行undo时，需要将undo的task invert，并压栈
   * @param  {[type]} task [description]
   * @return {[type]}      [description]
   */
  pushRedo: function(redoTask){
    this.redoStack.push(redoTask);
    this.redoableNum += 1;
  },

  popRedo: function(){
    var task = this.redoStack.pop();
    this.redoableNum -= 1;
    return task;
  },

  clearUndo: function(){
    this.undoStack = [];
    this.undoableNum = 0;
  },

  clearRedo: function(){
    this.redoStack = [];
    this.redoableNum = 0;
  },

  clear: function(){
    this.clearUndo();
    this.clearRedo();
  }

};


module.exports = stack;
