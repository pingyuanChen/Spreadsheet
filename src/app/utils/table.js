var richdoc       = require('richdoc');
var TableOperator = richdoc.TableOperator;
var constants     = require('./constants');
var formulaUtils  = require('./formula/formula_utils');
// var BC            = require('bc');

function isFormula(val){
  if(typeof val != 'string'){
    return false;
  }
  if(val[0] == '='){
    return true;
  }
  return false;
}

function getFormulaParaFromDom(str){
  var tempContainer = $('<div></div>'),
    paraDom;
  tempContainer.append(str);
  paraDom = tempContainer.find('.formula-paras');
  if(paraDom.length > 0){
    return paraDom.html();
  }else if(isFormula(str)){
    str = str.trim();
    return str.slice(1);
  }
  return '';
}


function fillFormula(editorVal, formulaPara){
  var tempContainer = $('<div></div>'),
    paraDom;
  tempContainer.append(editorVal);
  paraDom = tempContainer.find('.formula-paras');
  if(paraDom.length > 0){
    paraDom.html(formulaPara);
  }
  return tempContainer.html();
}


function wrapFormulaCellText(formula){
  var tokenItems,
    item, html = '=';
  if(typeof formula == 'string'){
    tokenItems = getFormulaToken(formula).items;
  }else{
    tokenItems = formula;
  }
  for(var i=0,l=tokenItems.length; i<l; i++){
    item = tokenItems[i];
    if(item.subtype == 'range'){
      html += '<span class="formula-paras">'+item.value+'</span>';
    }else{
      html += item.value;
    }
  }
  return html;
}

/**
 * 根据token.items组合成公式，不带样式
 * @param  {[type]} tokenItems [description]
 * @return {[type]}         [description]
 */
function genFormulaByToken(tokenItems){
  var item, formula = '=';
  for(var i=0,l=tokenItems.length; i<l; i++){
    item = tokenItems[i];
    formula += item.value;
  }
  return formula;
}


function getFormulaToken(formula){
  formula = formula || '';
  var token = formulaUtils.getTokens(formula);
  return token;
}


function getFormulaRange(formula){
  var tokenItems = getFormulaToken(formula).items,
    item, rangeAry = [];
  for(var i=0,l=tokenItems.length; i<l; i++){
    item = tokenItems[i];
    if(item.subtype == 'range'){
      rangeAry.push(item.value);
    }
  }
  return rangeAry;
}

function getFormulaColor(){
  return ['#189dec', '#a69aca', '#ec6e79', '#f39801', '#00a496',
          '#ffd900', '#674599', '#83d4e7', '#af7c4f', '#b8d200',
          '#9d5b8b', '#f15b1c', '#41464b', '#cd9f00', '#47885e',
          '#d7003b', '#436ec9', '#f897c7', '#9c4109', '#6e7a56',
          '#83d4e7', '#83609c', '#f8dcdb', '#e7c39c', '#87b151',
          '#9e0038', '#b09fc9', '#7dcfc8', '#bee7f0', '#cd9f00',
          '#cbaac2', '#f5c5c9', '#cd8c28', '#1a5a52', '#9eb4e1',
          '#406619', '#cab738', '#f6c751', '#8d699d', '#613a14'];
}


function isFormulaPara(para){
  var paraReg = /(\w+):(\w+)/;
  return paraReg.test(para);
}

function parseFormulaPara(para){
  var start, end, splitAry;
  if(para.indexOf(':') > -1){
    splitAry = para.split(para); 
    start = richdoc.parsePosition(splitAry[0]);
    end = richdoc.parsePosition(splitAry[1]);
  }else{
    start = end = richdoc.parsePosition(para);
  }
  return {
    from: start,
    to: end
  };
}


/**
 * 判断html是否是空行：<div><p><span></span></p></div>
 * @param  {[type]}  html [description]
 * @return {Boolean}      [description]
 */
function isEmptyLine(html){
  var isEmpty = false;

  if($(html).find('img, a').length === 0
    && !$(html).text()
    && !_.trim($(html).text())){
    isEmpty = true;
  }
  return isEmpty;
}

/**
 * 判断单元格是否是空单元格
 */
function isEmptyCell(html){
  var divCls = constants.getAllClass(),
    divAttrs = ['rowspan', 'colspan'],
    dom, clsList;

  $dom = $(html);
  clsList = $dom[0].classList;
  for(var i=0,l=clsList.length; i<l; i++){
    if(divCls.indexOf(clsList[i]) > -1){
      return false;
    }
  }
  for(var j=0,len=divAttrs.length; j<len; j++){
    if($dom.attr(divAttrs[j])){
      return false;
    }
  }
  return true;
}


function validator(divVal){
  divVal = divVal.replace(/<div><br><\/div>/g, '<br>');
  divVal = divVal.replace(/<div>/g, '<br>');
  divVal = divVal.replace(/<\/div>/g, '');
  // divVal = divVal.replace(/<div>([^<\/]*)<\/div>/g, function(_, m){
  //   return '<br>'+m;
  // });
  return divVal;
}


function formulaValidator(formula){
  var token = getFormulaToken(formula),
    tokenItems = token.items,
    leftBraceIndex = -1, rightBraceIndex = -1, rangeIndex,
    item;
  for(var i=0,l=tokenItems.length; i<l; i++){
    item = tokenItems[i];
    if(item.type == 'operand' && item.value == '('){
      leftBraceIndex = i;
    }else if(item.type == 'operand' && item.value == ')'){
      rightBraceIndex = i;
    }
    if(leftBraceIndex > -1 && rightBraceIndex > -1){
      break;
    }
  }
  rangeIndex = _.findLastIndex(tokenItems, function(item){
    return item.subtype == 'range' || item.subtype == 'number';
  });
  if(leftBraceIndex > -1 && rightBraceIndex === -1){
    if(rangeIndex === -1){
      rangeIndex = tokenItems.length - 1;
    }
    token.insert(')', 'operand', 'text', rangeIndex + 1);
    return genFormulaByToken(token.items);
  }
  return formula;
}


function parsePosition(val){
  val = val.toUpperCase();
  var results = null;
  try{
    results = richdoc.parsePosition(val);
  }catch(e){

  }
  return results;
}

function setCurSheetIdOnly(id){
  window.cow.currentSheetId = id;
}

function setCurrentSheetId(id, dontChangePath){

  if(window.cow.readonly){
    window.cow.currentSheetId = id;
    BC.notify('sheet:switched:readonly', id);
    return;
  } else if (dontChangePath) {
    // 如果是历史的 sheet 切换，不要修改 window.cow.currentSheetId，否则会影响文档的 sheet 切换
    BC.notify('sheet:switched:readonly', id);
    return;
  } else {
    window.cow.currentSheetId = id;
    BC.notify('sheet:switched', id);
  }

  var pathname, pathnameAry, url;
  pathname = location.pathname;
  if(pathname.substr(0,1) == '/'){
    pathname = pathname.slice(1);
  }
  pathnameAry = pathname.split('/');

  if(id){
    if(pathnameAry.length == 2){
      pathnameAry.push(id);
    }else if(pathnameAry.length == 3){
      pathnameAry[2] = id;
    }
    url = '/'+pathnameAry.join('/');
    page.replace(url, null, false, false);
  }else{
    if(pathnameAry.length == 3){
      pathnameAry.splice(2, 1);
      url = '/'+pathnameAry.join('/');
      page.replace(url, null, false, false);
    }
  }
}



module.exports = {
  isFormula: isFormula,
  genFormulaByToken: genFormulaByToken,
  getFormulaToken: getFormulaToken,
  getFormulaParaFromDom: getFormulaParaFromDom,
  getFormulaRange: getFormulaRange,
  getFormulaColor: getFormulaColor,
  fillFormula: fillFormula,
  isFormulaPara: isFormulaPara,
  parseFormulaPara: parseFormulaPara,
  wrapFormulaCellText: wrapFormulaCellText,

  isEmptyLine: isEmptyLine,
  isEmptyCell: isEmptyCell,

  validator: validator,
  formulaValidator: formulaValidator,

  parsePosition: parsePosition,

  setCurrentSheetId: setCurrentSheetId,
  setCurSheetIdOnly: setCurSheetIdOnly
};



