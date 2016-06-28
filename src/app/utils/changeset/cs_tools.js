import richdoc, { TableOperator, CellOperator, TextOperator, Operator, Delta } from 'richdoc';
import { getStore } from '../../store';
import tableUtils from '../table';


var TEXT_ATTRS = ['link'];
var DATA_ATTRS = ['image'];  //用于TextOperator的data属性
var DIV_ATTRS = ['underline', 'strike', 'bold', 'italic', 'background', 'rowspan', 'colspan', 'formula', 'format', 'vertical', 'align','wrap']; //因为背景需要作用于单元格，而不是所有的p


module.exports = {
  changeCsAttrs: changeCsAttrs,
  changeCellOpsAttrs: changeCellOpsAttrs,
  changeTextAttrs: changeTextAttrs,
  replaceCellOpsAttrs: replaceCellOpsAttrs,

  getRowOps: getRowOps,
  getCsConstructorName: getCsConstructorName,

  getLineByIndex: getLineByIndex,
  getCsByCoords: getCsByCoords,
  getCellCsAttrs: getCellCsAttrs,
  getTableOps: getTableOps,
  getCellDeltaLen: getCellDeltaLen,

  genNewCellCs: genNewCellCs,
  genRemoveOps: genRemoveOps,
  getCurDoc: getCurDoc,
  sortCsByColumn: sortCsByColumn,
  sortCsByArea: sortCsByArea,

  findTableOpByCs: findTableOpByCs,
  findTableOpIndexByCs: findTableOpIndexByCs,
  getCurTableOp: getCurTableOp,
  getCurTableOpIndex: getCurTableOpIndex,
  getTableOpIndexByCs: getTableOpIndexByCs,
  getTableOpIndexById: getTableOpIndexById,
  findTableOpByApplyCs: findTableOpByApplyCs,

  sortOps: sortOps,

  wrapCurSheetCs: wrapCurSheetCs,
  clearAttrs: clearAttrs
};

/**
 * 给单元格的cs的CellOperator修改属性
 * @param  {[type]} cs       [description]
 * @param  {[type]} newAttrs [description]
 * @return {[type]}          [description]
 */
function changeCsAttrs(cs, newAttrs, type){
  var textAttrs = {},
    dataAttrs = {},
    paraAttrs = {},
    divAttrs = {};
  for(var key in newAttrs){
    if(TEXT_ATTRS.indexOf(key) > -1){
      textAttrs[key] = newAttrs[key];
    }else if(DATA_ATTRS.indexOf(key) > -1){
      dataAttrs[key] = newAttrs[key];
    }else{
      divAttrs[key] = newAttrs[key];
    }
  }
  //一次只能改变一个属性，所以只要一个条件满足就return
  if(Object.keys(textAttrs).length > 0){
    return changeTextAttrs(cs, textAttrs);
  }

  if(Object.keys(dataAttrs).length > 0){
    return changeDataAttrs(cs, dataAttrs);
  }
  
  if(Object.keys(divAttrs).length > 0 || type === 'clear-format'){
    return changeCellOpsAttrs(cs, divAttrs);
  }
  return cs;
}


/**
 * 给该cs的所有TextOperator添加属性
 * @param  {[type]} cs [description]
 * @return {[type]}    [description]
 */
function changeTextAttrs (cs, newAttrs) {
  var textOps = cs.data.ops,
    removeOps, newTextOp;

  if(textOps.length == 0){
    //新增text属性：新增图片，链接
    newTextOp = new TextOperator({
      action: 'insert',
      attributes: newAttrs,
      data: ' '
    });
    textOps = textOps.push(newTextOp);

  }else{
    _.forEach(textOps, function(textOpsItem){
      textOpsItem = _changeOpAttr(textOpsItem, newAttrs);
      return textOpsItem;
    });
    removeOps = genRemoveOps(textOps.length);
    textOps = textOps.push(removeOps);
  }
  return cs;
}


/**
 * 给cs的TextOperator添加data属性
 * @param  {[type]} cs       [description]
 * @param  {[type]} newAttrs [description]
 * @return {[type]}          [description]
 */
function changeDataAttrs(cs, newAttrs) {
  var deltaLen = cs.data.length,
    newDelta = new Delta(),
    removeOps, newTextOp, attributes;

  
  if(newAttrs.image){
    //TextOperator新增data：新增图片
    newTextOp = new TextOperator({
      action: 'insert',
      data: {
        image: newAttrs.image.url
      }
    });
    if(deltaLen > 0){
      removeOps = genRemoveOps(deltaLen);
      newDelta = newDelta.push(removeOps);
    }
    newDelta = newDelta.push(newTextOp);
    //图片默认居中对齐
    attributes = cs.getAttributes() || {};
    attributes.align = 'center';
    cs = cs.set({ attributes: attributes });
  }
  return cs.set({data: newDelta});
}


/**
 * 改变CellOperator的attributes
 * @param  {[type]} cs       [description]
 * @param  {[type]} newAttrs [description]
 * @return {[type]}          [description]
 */
function changeCellOpsAttrs(cs, newAttrs){
  var removeOps, extralAttrs;
  cs = _changeOpAttr(cs, newAttrs);
  extralAttrs = { action: 'retain' };
  if(cs.length > 0){
    extralAttrs.data = cs.length;
  }
  return cs.set(extralAttrs);
}


/**
 * 替换掉cellOps的attributes
 * @param  {[type]} cs       [description]
 * @param  {[type]} newAttrs [description]
 * @return {[type]}          [description]
 */
function replaceCellOpsAttrs(cs, newAttrs) {
  var csAttrs = {};
  var removeAttrs = clearAttrs(cs.getAttributes() || {});
  csAttrs.attributes = _.assign(removeAttrs, newAttrs);
  csAttrs.action = 'retain';
  if(cs.length > 0){
    csAttrs.data = cs.length
  }
  return cs.set(csAttrs);
}


function _changeOpAttr(op, newAttrs){
  var opAttrs, attributes;
  attributes = op.getAttributes() || {};
  opAttrs = _.assign(attributes, newAttrs);
  return op.set({ attributes: opAttrs });
}

/**
 * 根据当前TableOperator获取某row的operators
 * @param  {[type]} row  [index]
 * @param  {[type]} type [row, col]
 * @return {[type]}      [description]
 */
function getRowOps(row, type){
  var rowOps, itemOps, data = 0, tableOps;
  tableOps = getTableOps();
  rowOps = tableOps.data[type+'s'].ops;
  for(var i=0,l=rowOps.length; i<l; i++){
    itemOps = rowOps[i];
    data += itemOps.data;
    if(row <= data){
      return itemOps;
    }
  }
}


/**
 * 获取cs实例的constructorName
 * 
 * @param  {[type]} csItem [description]
 * @return {[type]}        [description]
 */
function getCsConstructorName(csItem){
  if(csItem instanceof CellOperator){
    return 'CellOperator';
  }else if(csItem instanceof TextOperator){
    return 'TextOperator';
  }else{
    return '';
  }
}


/**
 * 根据CellOperator获取指定行的ops
 * @param  {[type]} cs    [description]
 * @param  {[type]} index [description]
 */
function getLineByIndex(cs, index){
  if(!cs instanceof CellOperator){
    throw new Error('cs must be CellOperator!');
  }
  var pOps = cs.data.ops,
    pItem,
    pIndex = 0;

  for(var i=0,l=pOps.length; i<l; i++){
    pItem = pOps[i];
    if(_.isNumber(pItem.data)){
      pIndex += pItem.data;
    }else{
      pIndex += 1;
    }
    if(pIndex >= index+1){
      return pItem;
    }
  }
}


/**
 * 获取当前TableOperator
 */
function getTableOps(){
  var tableOps;
  doc = getCurDoc();
  tableOps = findTableOpByCs(doc);
  return tableOps;
}


/**
 * 根据单元格坐标，获取其CellOperator
 */
function getCsByCoords(row, col, curDoc){
  var doc,
    tableOps, cellOps, targetCellOps,
    rowColStr;
  doc = curDoc || getCurDoc();
  if(doc.length == 0){
    return null;
  }
  
  tableOps = findTableOpByCs(doc).data;
  cellOps = tableOps.cells.cells;
  rowColStr = richdoc.stringifyPosition(row, col);
  targetCellOps = cellOps[rowColStr];
  if(targetCellOps){
    targetCellOps = targetCellOps.set({ action: 'retain' });
  }
  return targetCellOps;
}


/**
 * 获取当前文档内容
 * @return {[type]} [description]
 */
function getCurDoc(disableSort){
  var store = getStore(),   //just get store instance not init
    appState, _submittedCS, doc;
  appState = store.getState();
  _submittedCS = appState.msg.submittedCS;
  doc = _submittedCS
          .compose(appState.msg.committingCS)
          .compose(appState.msg.userCS);
  if(!disableSort){
    doc = new Delta(sortOps(doc.ops));
  }
  return doc;
}


/**
 * 根据单元格坐标，获取该单元格的属性
 * @param  {[type]} row [description]
 * @param  {[type]} col [description]
 * @return {[type]}     [description]
 */
function getCellCsAttrs(row, col, curDoc){
  var targetCellOps = getCsByCoords(row, col, curDoc),
    filteredCellAttrs;
  filteredCellAttrs = (targetCellOps && targetCellOps.getAttributes()) || null;
  return filteredCellAttrs;
}


function getCellDeltaLen(row, col, curDoc){
  var targetCellOps = getCsByCoords(row, col, curDoc),
    cellOps = [], cellOpItem,
    len = 0;
  if(targetCellOps && targetCellOps.data){
    cellOps = targetCellOps.data.ops;
    for(var i=0,l=cellOps.length; i<l; i++){
      cellOpItem = cellOps[i];
      if(cellOpItem.action == 'remove'){
        continue;
      }
      len += cellOpItem.length;
    }
  }
  return len;
}


function genRemoveOps(data){
  return new Operator({
    action: 'remove',
    data: data
  });
}

function genNewCellCs(cellOps){
  cellOps = cellOps || [];
  return new CellOperator({
    action: 'retain',
    data: new Delta(cellOps)
  });
}

/**
 * 将当前修改的TableOperator retain 后return;
 * 结构类似于：
 * {
 *   Operator: { action: 'retain', data: index},
 *   TableOperator: {action: 'retain', data: xx}
 * }
 */
function genNewDocCs(){
  var newDocCs, curIndex, newOps = [], 
    curDocAttrs;
  newDocCs = getCurDoc(true);
  curIndex = getCurTableOpIndex(true);
  curDocAttrs = newDocCs.ops[curIndex].getAttributes();

  if(curIndex > 0) {
    newOps.push(new Operator({
      action: 'retain',
      data: curIndex
    }));
  }

  newOps.push(new TableOperator({
    action: 'retain',
    attributes: curDocAttrs,
    data: {
      cells: {}
    }
  }));

  return new Delta(newOps);
}

/**
 * 根据sortIndex对当前table cs进行排序
 * @param  {[type]} columnIndex [description]
 * @return {[type]}             [description]
 */
function sortCsByColumn(sortIndex){
  var doc = getCurDoc(),
    docDelta = findTableOpByCs(doc).data,
    cellsDelta = docDelta.cells,
    rowsDelta = docDelta.rows,
    rowsLen = rowsDelta.length,
    rowIndex = 0, rowIndexOffset = 0, rowItem, rowItemData, newRowsAry = [], newRowsAttrs,
    rowColNum, row, col, newRow, newRowColStr,
    removeAttrs = {}, newAttrs, oldAttrs,
    newDoc, newDocDelta, oldCellDelta, tempNewCellDelta, tempOldCellDelta,
    oldCellNewRow, oldCellNewDelta, attributes,
    curSheetIndex;


  newDoc = genNewDocCs();
  newDocDelta = newDoc.ops[newDoc.ops.length - 1].data;

  //reconstruct cells
  // data这一级自带forEach方法
  cellsDelta.forEach(function(key){
    rowColNum = richdoc.parsePosition(key);
    row = rowColNum.row;
    col = rowColNum.col;
    newRow = getNewRow(row);
    if(newRow == row){
      return;
    }
    newRowColStr = richdoc.stringifyPosition(newRow, col);
    tempNewCellDelta = cellsDelta.get(newRowColStr);  //新坐标原来的值，要用tempOldCellDelta替换新坐标原来的值
    tempOldCellDelta = cellsDelta.get(key);   //旧坐标原来的值，会替换新坐标的旧值

    //oldDelta has data
    if(tempNewCellDelta && tempNewCellDelta.data.length > 0){

      // delta set之后会return一个新的delta，之前的不会被修改，所以需要重新赋值
      // data.push 之后会产生一个新的data，之前的不会被修改，所以需要重新set
      tempOldCellDelta = tempOldCellDelta.set({ data: tempOldCellDelta.data.push(genRemoveOps(tempNewCellDelta.data.length)) });
    }

    oldAttrs = tempOldCellDelta && tempOldCellDelta.getAttributes();
    newAttrs = tempNewCellDelta && tempNewCellDelta.getAttributes();
    tempOldCellDelta = tempOldCellDelta.set({ 
      attributes: _mergeAttrs(newAttrs, oldAttrs),  //oldDelta要被放在newRowColStr的位置上，所有要oldAttrs覆盖newAttrs
      action: 'retain' 
    });

    newDocDelta.cells.set(newRowColStr, tempOldCellDelta);

    //process old cell coords
    //排序之前有值，排序之后清空
    oldCellDelta = cellsDelta.get(key);
    if(oldCellDelta.data.length > 0){
      oldCellNewRow = sortIndex[row][0];
      oldCellNewDelta = cellsDelta.get(richdoc.stringifyPosition(oldCellNewRow, col));
      if(oldCellNewRow == row){
        return;
      }
      if(!oldCellNewDelta || oldCellNewDelta.data.length == 0){
        removeAttrs = clearAttrs(oldCellDelta.getAttributes());
        newDocDelta.cells.set(key, genNewCellCs([genRemoveOps(oldCellDelta.data.length)]));
        newDocDelta.cells.set(key, newDocDelta.cells.get(key).set({ attributes: removeAttrs }));
      }
    }
  })

  //reconstruct rows
  rowIndex = 0;
  var clearArys = {};
  var newArys = {};

  for(var i=0,l=rowsDelta.ops.length; i<l; i++){
    rowItem = rowsDelta.ops[i];
    rowItemData = rowItem.data;
    attributes = rowItem.getAttributes();
    if(Object.keys(attributes).length > 0){
      for(var j=0; j<rowItemData; j++){
        rowIndex = rowIndex+j;
        newRow = getNewRow(rowIndex);
        if(newRow != rowIndex){
          //row index changed
          newRowsAttrs = clearAttrs(attributes);

          // 如果之前没有设置过新的值，那么重置rowIndex的属性
          if(newArys[rowIndex] === undefined) {
            newRowsAry.push([rowIndex, newRowsAttrs]);
            clearArys[rowIndex] = newRowsAry.length - 1;
          }
          
          // 如果之前没有清空过newRow的属性，那么设置它，如果清空过，直接重新对属性赋值
          if(clearArys[newRow] === undefined) {
            newRowsAry.push([newRow, attributes]);
            newArys[newRow] = attributes;
          } else {
            newRowsAry[clearArys[newRow]][1] = attributes;
          }
          
        }
      }
    }
    rowIndex += rowItemData;
  }

  newRowsAry = newRowsAry.sort(function(a, b){
    return a[0] - b[0];
  });
  rowIndex = 0;
  newDocDelta.rows = new richdoc.Delta();

  // 假设目前只有第二行，第五行有属性，如下：
  // 行数    属性
  //  0
  //  1      height: 100
  //  2
  //  3
  //  4      height: null
  //  5
  // 循环处理这2个对象；
  // 第二行 rowIndex = 0, rowIndexOffset = 1，此时直接将offset值设置；
  // 第五行 rowIndex = 5, rowIndexOffset = 3，此时和上一行只相差2行，所以offset--；
  for(var index=0,len=newRowsAry.length; index<len; index++){
    rowItem = newRowsAry[index];
    rowIndexOffset = rowItem[0] - rowIndex;
    rowIndex = rowItem[0];

    if(index !== 0) {
      rowIndexOffset --;
    }

    // 将2次之间的间距生成cs
    if(rowIndexOffset > 0) {
      newDocDelta.rows = newDocDelta.rows.push(new Operator({ action: 'retain', data: rowIndexOffset }) )
    }

    // 将当前修改的属性生成cs
    newDocDelta.rows = newDocDelta.rows.push(new Operator({ action: 'retain', data: 1, attributes: rowItem[1] }));

  }

  return newDoc;


  function getNewRow(oldRow){
    return _.findIndex(sortIndex, function(item){
      return item[0] == oldRow;
    });
  }
}


function sortCsByArea(sortIndex, startRow){
  var doc = getCurDoc(),
    docDelta = findTableOpByCs(doc).data,
    cellsDelta = docDelta.cells,
    rowsDelta = docDelta.rows,
    newDoc, newDocDelta,
    newRow, oldRow, sortIndexItem, sortIndexItemRowColNum,
    tempOldCellDelta, tempNewCellDelta,
    oldRowColStr, newRowColStr;

  newDoc = genNewDocCs();
  newDocDelta = newDoc.ops[newDoc.ops.length - 1].data;

  for(var i=0,l=sortIndex.length; i<l; i++){
    sortIndexItem = sortIndex[i];
    newRow = startRow + i;
    oldRow = sortIndexItem[0];
    if(newRow == oldRow){
      continue;
    }
    _(sortIndexItem[2]).forEach(function(item){
      sortIndexItemRowColNum = richdoc.parsePosition(item);
      newRowColStr = richdoc.stringifyPosition(newRow, sortIndexItemRowColNum.col);
      tempNewCellDelta = cellsDelta.get(newRowColStr);  //新坐标旧值
      tempOldCellDelta = cellsDelta.get(item) || genNewCellCs();

      if(tempNewCellDelta && tempNewCellDelta.data.length){
        //新坐标原来有值
        tempOldCellDelta = tempOldCellDelta.set({ data: tempOldCellDelta.data.push(genRemoveOps(tempNewCellDelta.data.length)) });
      }

      //process attributes
      if(tempNewCellDelta){
        tempOldCellDelta = tempOldCellDelta.set({ attributes: _mergeAttrs(tempNewCellDelta.getAttributes(), tempOldCellDelta.getAttributes()) });
      }

      tempOldCellDelta = tempOldCellDelta.set({ action: 'retain' });

      newDocDelta.cells.set(newRowColStr, tempOldCellDelta);
    })
  }
  return newDoc;

  function getNewRow(oldRow){
    var index = _.findIndex(sortIndex, function(item){
      return item[0] == oldRow;
    });
    index += startRow;
    return index;
  }
}


function _mergeAttrs(oldAttrs, newAttrs){
  oldAttrs = oldAttrs || {};
  newAttrs = newAttrs || {};
  for(var key in oldAttrs){
    if(!newAttrs[key]){
      newAttrs[key] = null;
    }
    if(oldAttrs.formula){   //做merge属性时，formula不变，因为formula根据位置而定
      newAttrs.formula = oldAttrs.formula;
    }
  }
  return newAttrs;
}

function clearAttrs(attrs){
  var removeAttrs = {};
  for(var key in attrs){
    removeAttrs[key] = null;
  }
  return removeAttrs;
}


/**
 * Find TableOperator by given cs
 * @param  {[type]} cs      [description]
 * @param  {[type]} sheetId [optional]
 * @return {[type]}         [description]
 */
function findTableOpByCs(cs, sheetId){
  var ops = cs.ops,
    targetOpIndex, targetOp;
  targetOpIndex = findTableOpIndexByCs(cs, sheetId);
  targetOp = ops[targetOpIndex];
  return targetOp;
}

function findTableOpIndexByCs(cs, sheetId){
  // 如果 sheetId 是 0，则取第一个 sheet
  if (sheetId === 0) {
    sheetId = undefined;
  } else {
    sheetId = sheetId || window.cow.currentSheetId;
  }

  var ops = cs.ops, targetOpIndex;
  targetOpIndex = _.findIndex(ops, function(item){
    var itemAttrs = item.getAttributes();
    return itemAttrs && itemAttrs.id == sheetId;
  });
  if(targetOpIndex === -1){
    targetOpIndex = 0;
  }
  return targetOpIndex;
}

function getCurTableOp(){
  var doc = getCurDoc(),
    targetOpIndex = getCurTableOpIndex();
  return doc.ops[targetOpIndex];
}

function getCurTableOpIndex(disableSort){
  var doc = getCurDoc(disableSort);
  return findTableOpIndexByCs(doc);
}

function getTableOpIndexByCs(doc){
  return findTableOpIndexByCs(doc);
}


function getTableOpIndexById(id){
  var doc = getCurDoc();
  return findTableOpIndexByCs(doc, id);
}

/**
 * 根据需要apply的changeset找到当前需操作的TableOperator
 * @param  {[type]} cs [description]
 * @return {[type]}    [description]
 */
function findTableOpByApplyCs(cs){
  var ops = cs.ops, opItem, targetOp;
  for(var i=0,l=ops.length; i<l; i++){
    opItem = ops[i];
    if(typeof opItem.data == 'object'){
      targetOp = opItem;
    }
  }
  if(!targetOp){
    targetOp = ops[ops.length - 1];
  }
  return targetOp;
}


/**
 * 针对多sheet，根据tableOps，将其加入到当前的sheet，并返回整个表格的changeset
 * @param  {[type]} tableOps [description]
 * @param  {[type]} index    [description]
 * @return {[type]}          [description]
 */
function wrapCurSheetCs(tableOps, index){
  var changeset, curOpIndex, ops = [],
    doc = getCurDoc(true), curDocAttrs, newAttrs;
  if(index === undefined){
    curOpIndex = getTableOpIndexByCs(doc);
  }else{
    curOpIndex = index;
  }

  if(curOpIndex > 0){
    ops.push(new TableOperator({
      action: 'retain',
      data: curOpIndex
    }));
  }

  //每次修改都将当前TableOperator的id等属性带上，这样apply changeset的时候，知道当前操作的是哪个sheet
  curDocAttrs = doc.ops[curOpIndex].getAttributes();
  newAttrs = _.assign(curDocAttrs, tableOps.getAttributes());
  tableOps = tableOps.set({
    attributes: newAttrs
  });
  ops.push(tableOps);

  changeset = new Delta(ops);
  return changeset;
}


/**
 * 根据ops按照order排序，返回排序后的ops
 * @param  {[type]} ops [description]
 * @return {[type]}     [description]
 */
function sortOps(ops){
  var sortedOps = [],
    opAttrs, opId, opOrder,
    srcOrderAry = [],
    sortedOrderAry, sortedOps = [],
    mapOps = {};
  for(var i=0,l=ops.length; i<l; i++){
    opAttrs = ops[i].getAttributes();
    opId = opAttrs.id;
    opOrder = opAttrs.order;
    srcOrderAry.push([opOrder, opId]);
    mapOps[opId] = ops[i];
  }

  sortedOrderAry = srcOrderAry.sort(sortOrder);
  for(var j=0,len=sortedOrderAry.length; j<len; j++){
    sortedOps.push(mapOps[sortedOrderAry[j][1]]);
  }
  return sortedOps;

  function sortOrder(a,b){
    return a[0] - b[0];
  }
}


