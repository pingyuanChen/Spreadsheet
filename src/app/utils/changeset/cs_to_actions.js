var richdoc            = require('richdoc');
var Delta              = richdoc.Delta;
var TableOperator      = richdoc.TableOperator;
var CellOperator       = richdoc.CellOperator;
var ParagraphOperator  = richdoc.ParagraphOperator;
var TextOperator       = richdoc.TextOperator;
var tableUtils         = require('../table');
var csInterconvertHtml = require('./cs_interconvert_html');
var cells2Html         = csInterconvertHtml.cells2Html;
var html2Cs            = csInterconvertHtml.html2Cs;
var csTools            = require('./cs_tools');
var selectionUtils     = require('../selection');


module.exports = {
  changeset2Actions: changeset2Actions,
  tableOps2Actions: tableOps2Actions,
  newlineOps: newlineOps
};


function changeset2Actions(srcData){
  var rows = {
      rowActions: null,
      attrsActions: null
    },
    cols = {
      rowActions: null,
      attrsActions: null
    },
    cells, mergeCells, item, tableActions,
    transActions,  //将changeset转换成table所识别的action: insertRow, insertCol, insertCell
    tableOps, tableDelta;
  tableOps = srcData;
  tableDelta = tableOps.data;

  //table operator
  tableActions = tableOps2Actions(tableOps);

  //table delta
  for(var key in tableDelta){
    item = tableDelta[key];
    if(key == 'rows'){
      rows = row2Actions(item.ops);
    }else if(key == 'cols'){
      cols = row2Actions(item.ops);
    }else if(key == 'cells'){
      cells = cell2Actions(item);
      mergeCells = csInterconvertHtml.getMergeCells(item);
    }
  }
  transActions = {
    table: tableActions,
    rows: rows.rowActions,
    rowsAttr: rows.attrsActions,
    cols: cols.rowActions,
    colsAttr: cols.attrsActions,
    cells: cells,
    mergeCells: mergeCells
  };

  return transActions;
}


/**
 * 根据TableOperator生成相应的行为，当前主要是attributes
 * @param  {[type]} tableOps [description]
 * @return {[type]}          [description]
 */
function tableOps2Actions(tableOps){
  var attrs = tableOps.getAttributes() || {};
  return attrs;
}


/**
 * 根据changset生成table对应的行，列操作
 * @param  {[array]} ops [description]
 * @return {[array]}     [description]
 */
function row2Actions(ops){
  var index = 0,  //遍历时当前操作是基于index操作的
    op, data, action,
    tableActions = ['insert', 'remove'], //表格的操作只有insert, remove
    rowActions = [],
    attrsActions = [];

  for(var i=0,l=ops.length; i<l; i++){
    op = ops[i];
    data = parseInt(op.data);
    action = op.action;
    if(_.includes(tableActions, action)){
      rowActions.push({
        type: action,
        index: index,
        amount: data
      });
    }
    if(op.getAttributes()){
      //行列的属性相关变化单独处理
      attrsActions.push({
        type: 'attr',
        index: index,
        amount: data,
        attrs: op.getAttributes()
      })
    }
    index += data;
  }
  return {
    rowActions: rowActions,
    attrsActions: attrsActions
  };
}

/**
 * 根据changeset生成table对应的cell操作
 * @param  {[type]} cells [description]
 * @return {[type]}       [description]
 */
function cell2Actions(cells){
  var item, originalCs,
    row, col,
    rowColNum,
    cellActions = [], cellActionItem, cellMeta,
    value;

  var curDoc =  csTools.getCurDoc();

  cells.forEach(function (cellPosition) {
    item = cells.get(cellPosition);
    rowColNum = richdoc.parsePosition(cellPosition);
    row = rowColNum.row;//数组从0开始
    col = rowColNum.col;
    originalCs = csTools.getCsByCoords(row, col, curDoc);
    if(item.data == 1 && originalCs){
      //当只改变单元格属性时，需要跟之前的data compose
      item = originalCs.compose(item);  //compose data and attrs
    }
    value = cells2Html(item);
    cellMeta = csInterconvertHtml.processCellAttrs(item);
    cellActionItem = {
      row: row,
      col: col,
      value: value,
      attrs: item.getAttributes(),
      tdAttrs: cellMeta
    };
    cellActions.push(cellActionItem);
  })
  

  return cellActions;
}


/**
 * 单元格里执行换行操作，并产生新的cs
 */
function newlineOps(dom){
  var sel = window.getSelection(),
    range = sel.getRangeAt(0),
    selContent = sel.focusNode.textContent,
    selOffset = sel.focusOffset,
    afterContent = selContent.slice(selOffset, selContent.length),
    br, div;

  if(!afterContent && !sel.focusNode.nextSibling){
    //insert new line at the end of cell
    div = document.createElement('div');
    div.innerHTML = '<br>'
    dom.appendChild(div);
    selectionUtils.setCaretByDom(dom.lastChild);
  }else{
    br = document.createElement('br');
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}








