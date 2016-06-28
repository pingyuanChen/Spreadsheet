var richdoc       = require('richdoc');
var Operator      = richdoc.Operator;
var TableOperator = richdoc.TableOperator;
var Delta         = richdoc.Delta;
var csTools       = require('./cs_tools');

module.exports = {
  newSheet: newSheet,
  deleteSheet: deleteSheet,
  updateSheetName: updateSheetName,
  copySheet: copySheet,
  addOrderToOps: addOrderToOps,
  sortOps: sortOps
};


function newSheet(index){
  var doc = csTools.getCurDoc(true),
    curOpsLen = doc.ops.length,
    firstTableOps = doc.ops[0], firstTableAttrs, newFirstTableAttrs,
    nextIndex,
    operators = [],
    id = genId();
  firstTableAttrs = firstTableOps.getAttributes();
  nextIndex = firstTableAttrs.nextIndex+1 || curOpsLen+1;

  if(index > 0){
    //Updating first TableOperator nextIndex attribute for new sheet action
    newFirstTableAttrs = _.assign(firstTableAttrs, {nextIndex: nextIndex});
    operators.push(new TableOperator({
      action: 'retain',
      data: 1,
      attributes: newFirstTableAttrs
    }));

    if(index-1 > 0){
      operators.push(new TableOperator({
        action: 'retain',
        data: index - 1
      }));
    }
  }
  operators.push(new TableOperator({
    action: 'insert',
    attributes: {
      id: id,
      name: '工作表'+nextIndex,
      order: nextIndex - 1 
    },
    data: {
      rows: new Delta([
        new Operator({action: 'insert', data: 200})
      ]),
      cols: new Delta([
        new Operator({action: 'insert', data: 18})
      ]),
      cells: {}
    }
  }));
  return {
    curSheetId: id,
    cs: new Delta(operators)
  };
}

function deleteSheet(id){
  var index,
    doc = csTools.getCurDoc(true),
    curTableOps, siblingTableDom,
    operators = [], oldAttrs;
  if(id === undefined){
    id = window.cow.currentSheetId;
  }
  index = csTools.findTableOpIndexByCs(doc, id);
  oldAttrs = doc.ops[index].getAttributes();

  //如果删除的是当前sheet，删除完后，当前sheet需要前移，否则，不改变当前sheetId
  if(id === window.cow.currentSheetId){
    siblingTableDom = $('#'+id).prev();
    if(siblingTableDom.length === 0){
      siblingTableDom = $('#'+id).next();
    }
    id = siblingTableDom.attr('id');
  }else{
    id = window.cow.currentSheetId;
  }

  if(index > 0){
    operators.push(new TableOperator({
      action: 'retain',
      data: index
    }));
  }
  operators.push(new Operator({
    action: 'remove',
    attributes: oldAttrs,
    data: 1
  }));

  return {
    curSheetId: id,
    cs: new Delta(operators)
  };
}

function updateSheetName(name, id){
  var index,
    doc = csTools.getCurDoc(true),
    oldAttrs,
    operators = [];
  if(id === undefined){
    id = window.cow.currentSheetId;
  }
  index = csTools.findTableOpIndexByCs(doc, id);
  oldAttrs = doc.ops[index].getAttributes();
  oldAttrs.name = name;

  if(index > 0){
    operators.push(new Operator({
      action: 'retain',
      data: index
    }));
  }
  operators.push(new Operator({
    action: 'retain',
    attributes: oldAttrs,
    data: 1
  }));
  return new Delta(operators);
}

function copySheet(id){
  var index,
    doc = csTools.getCurDoc(true),
    curTableOps, oldAttrs, oldName,
    operators = [],
    newId = genId();
  if(id === undefined){
    id = window.cow.currentSheetId;
  }
  index = csTools.findTableOpIndexByCs(doc, id);
  curTableOps = doc.ops[index];
  oldAttrs = curTableOps.getAttributes();
  if(oldAttrs && oldAttrs.name){
    oldName = oldAttrs.name;
  }else{
    oldName = '工作表1';
  }
  oldAttrs.name = '副本 '+oldName;
  oldAttrs.id = newId;
  curTableOps = curTableOps.set({
    attributes: oldAttrs,
    action: 'insert'
  });

  operators.push(new TableOperator({
    action: 'retain',
    data: index + 1
  }));
  operators.push(curTableOps);

  return {
    curSheetId: newId,
    cs: new Delta(operators)
  };
}

function addOrderToOps(){
  var doc = csTools.getCurDoc(true),
    ops = doc.ops, attrs,
    operators = [];
  for(var i=0,l=ops.length; i<l; i++){
    attrs = ops[i].getAttributes();
    attrs.order = i;
    operators.push(new Operator({
      action: 'retain',
      attributes: attrs,
      data: 1
    }));
  }
  return new Delta(operators);
}

function sortOps(sortedArray){
  var doc = csTools.getCurDoc(true),
    ops = doc.ops,
    srcItem, srcItemAttrs, srcItemId, newOrder, oldOrder,
    retain = 0, operators = [], newAttrs;
  for(var i=0,l=ops.length; i<l; i++){
    srcItem = ops[i];
    srcItemAttrs = srcItem.getAttributes();
    srcItemId = srcItemAttrs.id || 0;
    oldOrder = srcItemAttrs.order;
    newOrder = sortedArray.indexOf(srcItemId);
    if(oldOrder == newOrder){
      retain += 1;
    }else{
      if(retain > 0){
        operators.push(new TableOperator({
          action: 'retain',
          data: retain
        }));
      }
      newAttrs = srcItemAttrs;
      newAttrs.order = newOrder;
      operators.push(new Operator({
        action: 'retain',
        attributes: newAttrs,
        data: 1
      }));
      retain = 0;
    }
  }
  return new Delta(operators);
}

function genId(){
  var text = '',
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}





