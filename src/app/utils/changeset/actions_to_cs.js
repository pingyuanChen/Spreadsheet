var richdoc            = require('richdoc');
var Delta              = richdoc.Delta;
var TableOperator      = richdoc.TableOperator;
var Operator           = richdoc.Operator;
var CellOperator       = richdoc.CellOperator;
var TextOperator       = richdoc.TextOperator;
var tableUtils         = require('../table');
var domUtils           = require('../dom');
var csInterconvertHtml = require('./cs_interconvert_html');
var cells2Html         = csInterconvertHtml.cells2Html;
var html2Cs            = csInterconvertHtml.html2Cs;
var class2Attrs        = csInterconvertHtml.class2Attrs;
var csTools            = require('./cs_tools');

module.exports = {
  editCell2Changeset: editCell2Changeset,
  addRow2Changeset: addRow2Changeset,
  addCol2Changeset: addCol2Changeset,
  removeRow2Changeset: removeRow2Changeset,
  removeCol2Changeset: removeCol2Changeset,
  rowResize2Changeset: rowResize2Changeset,
  colResize2Changeset: colResize2Changeset,
  rowsAttrs2Cs: rowsAttrs2Cs,
  colsAttrs2Cs: colsAttrs2Cs,
  wrapCellCs: _wrapCellCs,

  mergeCells2Cs: mergeCells2Cs,
  unmergeCells2Cs: unmergeCells2Cs,

  cellAttrs2Changeset: cellAttrs2Changeset,
  genCsByCellAttrs: genCsByCellAttrs,

  tableAttrs2Cs: tableAttrs2Cs
};

/**
 * 编辑表格行为转成cs
 */
function editCell2Changeset(changes){
  var row, col, oldVal, newVal,
    rowColStr, //eg: B5
    changeset, cellsChangeset = {},
    cellsOps, newCellAttrs, changeItem;

  var curDoc = csTools.getCurDoc();

  changes.forEach(function(change){
    row = change[0];
    col = change[1];
    oldVal = change[2];
    newVal = change[3];
    rowColStr = richdoc.stringifyPosition(row, col);

    if(oldVal == newVal || (!oldVal && !newVal)){
      return;
    }

    if(tableUtils.isFormula(newVal)){
      newVal = domUtils.getDomText(newVal);
      cellsOps = csInterconvertHtml.formula2Cs(newVal, row, col, curDoc);
    } else if( domUtils.isHtml(newVal.toString().replace(/<br>/g, '')) && (changeItem = $(newVal)) && changeItem[0].tagName.toLowerCase() == 'td'){
      // 同时处理paste和带样式的autofill      
      newVal = changeItem.html();
      collabedFun = csInterconvertHtml.collabTdAttrs(changeItem[0]);
      newCellAttrs = collabedFun('cellProperties');
      if(tableUtils.isFormula(newVal)){
        //赋值粘贴公式单元格
        newCellAttrs.type = 'formula';
        newVal = domUtils.getDomText(newVal);
        cellsOps = csInterconvertHtml.formula2Cs(newVal, row, col, curDoc);
      }else{
        _attributes = _.assign(class2Attrs(newCellAttrs.classes), newCellAttrs.dataAttrs);
        cellsOps = html2Cs(newVal, row, col, curDoc, _attributes);
      }
      window.tableInst.setCellMetaObject(row, col, newCellAttrs);
    }else{
      cellsOps = html2Cs(newVal, row, col, curDoc);
      if(tableUtils.isFormula(oldVal) && !tableUtils.isFormula(newVal)){
        //The cell type was formula, and now is normal after edited: need change cell type
        window.tableInst.setCellMeta(row, col, 'type', 'html');
      }
    }
    
    cellsChangeset[rowColStr] = cellsOps;
  });

  if(Object.keys(cellsChangeset).length == 0){
    return null;
  }

  changeset = _wrapCellCs(cellsChangeset);

  return changeset;
}


function addRow2Changeset(index, amount){
  return _wrapRowCs(_genRowOps(index, amount, 'row', 'insert'));
}

function addCol2Changeset(index, amount){
  return _wrapColCs(_genRowOps(index, amount, 'col', 'insert'));
}

function removeRow2Changeset(index, amount){
  return _wrapRowCs(_genRowOps(index, amount, 'row', 'remove'));
}

function removeCol2Changeset(index, amount){
  return _wrapColCs(_genRowOps(index, amount, 'col', 'remove'));
}


/**
 * convert row height changes to changeset
 */
function rowResize2Changeset(start, end, size){
  var attrs = {
    height: size
  };
  return _wrapRowCs(genRowsAttrsOps(start, end, attrs, 'row'));
}


/**
 * convert column width changes to changeset
 */
function colResize2Changeset(start, end, size){
  var attrs = {
    width: size
  };
  return _wrapColCs(genRowsAttrsOps(start, end, attrs, 'col'));
}

function rowsAttrs2Cs(start, end, attrs){
  return _wrapRowCs(genRowsAttrsOps(start, end, attrs, 'row'));
}


function colsAttrs2Cs(start, end, attrs){
  return _wrapColCs(genRowsAttrsOps(start, end, attrs, 'col'));
}


/**
 * cells attributes to changeset
 * @param  {[type]}  cells       [description]
 * @param  {[type]}  newAttrs    [description]
 * @param  {Boolean} isOverwrite [description]
 * @return {[type]}              [description]
 */
function cellAttrs2Changeset(cells, newAttrs, isOverwrite){
  var changeset,
    cellsChangeset = {},
    rowsChangeset = {},
    firstCell, firstCellOps, firstRowCol, firstCellRowOps,
    attrHeight, maxHeight,
    rowOps, curDoc, attributes;

  curDoc = csTools.getCurDoc();

  if(cells.length > 0 && newAttrs.image){
    //upload image: need to change row height attribute
    firstCell = cells[0];
    firstCellRow = richdoc.parsePosition(firstCell).row + 1;
    firstCellOps = _genCellOps(firstCell, newAttrs);
    cellsChangeset[firstCell] = firstCellOps;

    firstCellRowOps = csTools.getRowOps(firstCellRow, 'row');
    attrHeight = newAttrs.image.height;

    attributes = firstCellRowOps.getAttributes();
    if(!attributes
       || (attributes && attributes.height < attrHeight)){
      rowOps = _genRowAttrsOps(firstCellRow, {height: attrHeight}, 'row');
      changeset = _wrapChangeset({
        rows: new Delta(rowOps),
        cells: cellsChangeset
      });
      return changeset;
    }

  }else{
    _.forEach(cells, function(key){
      cellsChangeset[key] = _genCellOps(key, newAttrs, isOverwrite);
    });
  }

  if(!_.isEmpty(cellsChangeset)){
    changeset = _wrapCellCs(cellsChangeset);
  }
  return changeset;


  function _genCellOps(key, newAttrs, isOverwrite){
    var oldCellCs, newCellCs, rowColObj;
    rowColObj = richdoc.parsePosition(key);
    oldCellCs = csTools.getCsByCoords(rowColObj.row, rowColObj.col, curDoc) || csTools.genNewCellCs();
    if(isOverwrite){
      newCellCs = csTools.replaceCellOpsAttrs(oldCellCs, newAttrs);
    }else{
      newCellCs = csTools.changeCsAttrs(oldCellCs, newAttrs);
    }
    return newCellCs;
  }
}

/**
 * 根据attrs生成单元格的cs(更新的cs，并非完整的cs)
 * @param  {[object]} newAttrs
 */
function genCsByCellAttrs (newAttrs) {
  return new CellOperator({
    action: 'retain',
    data: 1,
    attributes: newAttrs
  });
}

/**
 * 合并单元格行为转换成cs
 */
function mergeCells2Cs(ops){
  var start = ops.start,
    end = ops.end,
    rowColStr = richdoc.stringifyPosition(start.row, start.col),
    rowspan = end.row - start.row + 1,
    colspan = end.col - start.col + 1,
    cs;

  cs = cellAttrs2Changeset([rowColStr], {
    rowspan: rowspan,
    colspan: colspan
  });
  return cs;
}

/**
 * 取消合并单元格行为转换成cs
 */
function unmergeCells2Cs(ops){
  var start = ops.start,
    end = ops.end,
    rowColStr = richdoc.stringifyPosition(start.row, start.col),
    cells = {};

  cells[rowColStr] = genCsByCellAttrs({
    rowspan: 0,
    colspan: 0
  });
  return _wrapCellCs(cells);
}


/**
 * Convert table attributes to changeset:
 * freeze row or unfreeze row
 * @param  {[type]} newAttrs [description]
 * @return {[type]}          [description]
 */
function tableAttrs2Cs(newAttrs){
  var tableOps = new TableOperator({
    action: 'retain',
    data: 1,
    attributes: newAttrs
  })
  return csTools.wrapCurSheetCs(tableOps);
}


//将operators外层包裹下
function _wrapChangeset(operators){
  var tableOps = new TableOperator({
    action: 'retain',
    data: operators
  });
  return csTools.wrapCurSheetCs(tableOps);
}


function _wrapRowCs(ops){
  var changeset;

  changeset = _wrapChangeset({
    rows: new Delta(ops)
  });
  return changeset;
}

function _wrapColCs(ops){
  var changeset;

  changeset = _wrapChangeset({
    cols: new Delta(ops)
  });
  return changeset;
}

function _wrapCellCs(ops){
  var changeset = _wrapChangeset({
    cells: ops
  });
  return changeset;
}


function _genRowOps(index, amount, type, action){
  var operators = [];
  if(index > 0){
    operators.push(new Operator({
      action: 'retain',
      data: index
    }));
  }
  operators.push(new Operator({
    action: action,
    data: amount
  }));
  return operators;
}

/**
 * 改变单行列的属性
 */
function _genRowAttrsOps(row, attrs, type){
  var operators = [],
    oldOps, oldOpsAttrs, newAttrs;
  oldOps = csTools.getRowOps(row, type);
  oldOpsAttrs = oldOps.getAttributes() || {};
  newAttrs = _.assign(oldOpsAttrs, attrs);

  if(row > 1){
    operators.push(new Operator({
      action: 'retain',
      data: row-1
    }));
  }
  operators.push(new Operator({
    action: 'retain',
    data: 1,
    attributes: newAttrs
  }));

  return operators;
}

/**
 * 改变多行列的属性
 */
function genRowsAttrsOps(start, end, attrs, type){
  var operators = [],
    oldOps, oldOpsAttrs, newAttrs;
  start += 1;  //ops的坐标从1开始
  end += 1;

  if(start > 1){
    operators.push(new Operator({
      action: 'retain',
      data: start - 1
    }));
  }
  for(var i=start; i<=end; i++){
    oldOps = csTools.getRowOps(i, type);
    oldOpsAttrs = oldOps.getAttributes() || {};
    newAttrs = _.assign(oldOpsAttrs, attrs);
    operators.push(new Operator({
      action: 'retain',
      data: 1,
      attributes: newAttrs
    }));
  }
  
  return operators;
}
