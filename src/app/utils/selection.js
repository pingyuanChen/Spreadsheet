var tableUtils = require('./table');

module.exports = {
  setCaretByDom: setCaretByDom,
  selectElementContents: selectElementContents,
  getSelectionPreChar: getSelectionPreChar
};


/**
 * set caret postion in contenteditable div by dom
 */
function setCaretByDom(dom, isStart){
  if (!dom) return;
  var sel = window.getSelection(),
    range, textRange;
  isStart = isStart || false;
  if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
    range = document.createRange();
    range.selectNodeContents(dom);
    range.collapse(isStart);
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    textRange = document.body.createTextRange();
    textRange.moveToElementText(dom);
    textRange.collapse(isStart);
    textRange.select();
  }
}


function selectElementContents(el) {
  var sel = window.getSelection(),
    range, textRange;
  if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
    range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.select();
  }
} 


function getSelectionPreChar(container){
  var sel = window.getSelection(),
    range, wholeText = '', offset, startContainer, containerIndex,
    preChar = '',
    contents = $(container).contents(),
    _contents, splitFormula = '', from = 0;
  if(sel.rangeCount){
    range = sel.getRangeAt(0);
    startContainer = range.startContainer;
    wholeText = startContainer.textContent;
    offset = range.startOffset,
    preChar = wholeText[offset-1];
    if(!wholeText.trim()){
      //如果通过menu点击，当前光标处于一个空的span中，找其相邻的前一个元素
      startContainer = startContainer.previousSibling;
      wholeText = startContainer.textContent;
      preChar = wholeText[wholeText.length-1];
    }
    containerIndex = findIndexByEle(container, startContainer);
    _contents = contents.slice(0, containerIndex);
    for(var i=0,l=_contents.length; i<l; i++){
      splitFormula += _contents[i].textContent;
    }
    from = tableUtils.getFormulaToken(splitFormula).items.length;

  }
  return {
    preChar: preChar,
    from: from
  };

  function findIndexByEle(container, target){
    var contents = $(container).contents(),
      item, index = -1;
    for(var i=0,l=contents.length; i<l; i++){
      item = contents[i];
      if(target.nodeType == 3 && item.nodeType == 1){
        item = $(item).contents()[0];
      }
      if(item == target){
        index = i;
        break;
      }
    }
    return index;
  }
}


