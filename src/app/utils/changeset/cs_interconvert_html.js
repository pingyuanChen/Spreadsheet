var richdoc       = require('richdoc');
var Delta         = richdoc.Delta;
var TableOperator = richdoc.TableOperator;
var CellOperator  = richdoc.CellOperator;
var Operator      = richdoc.Operator;
var TextOperator  = richdoc.TextOperator;
var tableUtils    = require('../table');
var domUtils      = require('../dom');
// var formatter     = require('../../app/formatter');
var constants     = require('../constants');
var csTools       = require('./cs_tools');

var MAP = constants.MAP,
  OP_MAP = constants.OP_MAP,
  CLASS_ATTRS = constants.CLASS_ATTRS,
  DATA_ATTRS = constants.DATA_ATTRS,
  TAG_ATTRS = constants.TAG_ATTRS,
  TEMPLATE = constants.TEMPLATE,
  DEFAULT_ALIGN_MAP = constants.DEFAULT_ALIGN_MAP;

var order = ['link'];

module.exports = {
  attrs2Style: attrs2Style,
  style2Attrs: style2Attrs,
  class2Attrs: class2Attrs,
  mergeAttrs: mergeAttrs,

  attrs2ClassAry: attrs2ClassAry,

  processAttrs: processAttrs,
  collabTdAttrs: collabTdAttrs,

  getMergeCells: getMergeCells,
  cells2Html: cells2Html,
  processCellAttrs: processCellAttrs,
  html2Cs: html2Cs,
  formula2Cs: formula2Cs
}


/**
 * 将cs attributes对象转换成style字符串
 */
function attrs2Style(attrs){
  var style = '',
    attrs = attrs || {};
  for(var key in attrs){
    style += key + ':' + attrs[key] + ';'
  }
  return style;
}

/**
 * 将html中style字符串转换成attributes对象
 */
function style2Attrs(style){
  var styleItem, styleSubItem,
    styleObj = {};
  style = style || '';
  styleItem = style.split(';');
  _.forEach(styleItem, function(item){
    styleSubItem = item.split(':');
    if(styleSubItem[0]){
      styleObj[styleSubItem[0]] = styleSubItem[1].trim();
    }
  });
  return styleObj;
}

/**
 * 将cs attributes对象转换成class array
 */
function attrs2ClassAry(attrs){
  var attrsClass = _.invert(CLASS_ATTRS),
    cls = [];
  attrs = attrs || {};
  for(var key in attrs){
    if(attrs[key]){
      cls.push(attrsClass[key]);
    }
  }
  return cls;
}

/**
 * 将cs attributes对象转换成tag: TAG_ATTRS
 */
function attrs2Tag(cellOpsItem, tagAttrs, ancestor){
  var content = cellOpsItem.data || '',
    sortedTagAry, tagTemplate;

  // attributes = ancestor.getAttributes();
  // if( attributes && attributes.format){
  //   content = formatter.format(content, attributes.format);
  // }
  if(typeof content != 'object'
     && (!tagAttrs || Object.keys(tagAttrs).length == 0)){
    return content;
  }

  if(typeof content == 'object'){
    //处理不带文本的tag: image, video
    for(var key in content){
      if(TEMPLATE[key]){
        tagTemplate = _.template(TEMPLATE[key]);
        content = tagTemplate(content);
      }
    }
  }else{
    //处理带文本的tag: link
    sortedTagAry = sortTag(tagAttrs);
    sortedTagAry.forEach(function(attr){
      var data, attrObj = {};
      attrObj[attr] = tagAttrs[attr];
      data = _.assign(attrObj, {content: content});
      template = _.template(TEMPLATE[attr]);
      content = template(data);
    });
  }
  
  return content;

  /**
   * 将tag属性按照order排序，保证所生成的html一致
   */
  function sortTag(tagAttrs){
    var tagAry = [],
      key;
    for(var i=0,l=order.length; i<l; i++){
      key = order[i];
      if(key in tagAttrs && tagAttrs[key]){
        tagAry.push(key);
      }
    }
    return tagAry;
  }
}



/**
 * 将html中class转换成attributes对象
 */
function class2Attrs(classList){
  var attrsObj = {}, multiClsItem;
  _.forEach(classList, function(item){
    if(CLASS_ATTRS[item]){
      attrsObj[CLASS_ATTRS[item]] = true;
    }
  });
  return attrsObj;
}

/**
 * 将cs attributes对象转换成dom属性： <div rowspan="1"></div>
 * @param  {[type]} dataAttrs [description]
 * @return {[type]}           [description]
 */
function attrs2DomAttr(dataAttrs){
  var attrsAry = [];
  if(Object.keys(dataAttrs).length === 0){
    return '';
  }
  for(var key in dataAttrs){
    attrsAry.push(key+'='+dataAttrs[key]);
  }
  return attrsAry.join(' ');
}


function mergeAttrs(attrs, newAttrs){
  var newItem,
    extendedAttrs = _.assign(attrs, newAttrs),
    mergedAttrs = {};
  for(var key in extendedAttrs){
    newItem = extendedAttrs[key];
    if(newItem !== null){
      mergedAttrs[key] = newItem;
    }
  }
  return mergedAttrs;
}

/**
 * 将cells changeset 的attributes分割成mergeCellAttrs，styleAttrs，classAttrs
 */
function processAttrs(cellCs){
  var attrs = cellCs.getAttributes() || {},
    ops = cellCs.data.ops || [], opItem,
    styleAttrs = {},
    dataAttrs = {},  //用于在dom上添加属性的：rowspan:1
    mergeCellAttrs = {},
    classAttrs = {},
    tagAttrs = {},
    attrsClass = _.invert(CLASS_ATTRS),
    multiClass;


  for(var key in attrs){
    if(DATA_ATTRS.indexOf(key) > -1){
      if(key == 'rowspan' || key == 'colspan'){
        mergeCellAttrs[key] = attrs[key];
      }
      dataAttrs[key] = attrs[key];
    }
    if(attrsClass[key] && attrs[key]){
      classAttrs[key] = attrs[key];
    }
    if(TAG_ATTRS[key]){
      tagAttrs[key] = attrs[key];
    }
  }

  if(ops.length > 0){
    opItem = ops[0];
    if(opItem && opItem.getAttributes() && opItem.getAttributes().link){
      classAttrs['link'] = true;
    }
  }

  return {
    mergeCellAttrs: mergeCellAttrs,
    dataAttrs: dataAttrs,
    classAttrs: classAttrs,
    tagAttrs: tagAttrs
  };
}

/**
 * 将cells changeset转换成handsontable的mergeCells option
 */
function getMergeCells(cells){
  var mergeCells = [],
    cellPos, mergeCellAttrs,
    _rowspan, _colspan;

  cells.forEach(function (cellPosition) {
    mergeCellAttrs = processAttrs(cells.get(cellPosition)).mergeCellAttrs;
    if(Object.keys(mergeCellAttrs).length > 0){
      cellPos = richdoc.parsePosition(cellPosition);
      _rowspan = mergeCellAttrs.rowspan || 1;
      _colspan = mergeCellAttrs.colspan || 1;
      mergeCells.push({
        row: cellPos.row,
        col: cellPos.col,
        rowspan: +_rowspan,
        colspan: +_colspan
      });
    }
  })
  
  return mergeCells;
}

/**
 * 将changeset转化成html
 */
function cells2Html(cellOpsItem, ancestor){
  if(cellOpsItem.action == 'remove'){
    return '';
  }

  /**特殊处理formula & format单元格**/
  var attributes = cellOpsItem.getAttributes();
  if( attributes && attributes.formula){
    //如果是公式单元格
    return attributes.formula;
  }
  if( attributes && attributes.format){
    //如果是format单元格
    if(cellOpsItem.data.ops[0]){
      return cellOpsItem.data.ops[0].data || '';
    }else{
      return '';
    }
  }


  var cellHtml = '',
    innerHtml,
    constructorName, ops,
    eles, processedAttrs, tagAttrs;

  ancestor = ancestor || cellOpsItem;

  constructorName = csTools.getCsConstructorName(cellOpsItem);
  ops = cellOpsItem.data.ops || [];
  eles = ops.map(function(opItem){
    return cells2Html(opItem, ancestor);
  });
  processedAttrs = processAttrs(cellOpsItem);
  tagAttrs = processedAttrs.tagAttrs;

  innerHtml = '';
  if(constructorName == 'TextOperator'){
    //如果是TextOperator
    innerHtml = attrs2Tag(cellOpsItem, tagAttrs, ancestor);
    innerHtml = innerHtml.replace(/\n/g, '<br>');
  }

  cellHtml = innerHtml+eles.join('');
  return cellHtml;
}

/**
 * 处理CellOperator的attributes，生成对应的class和attr，用于td赋值
 */
function processCellAttrs(cellOpsItem){
  var processedAttrs, attrsClass, dataAttrs,
    clsAry = ['s-cell'];
  processedAttrs = processAttrs(cellOpsItem);
  attrsClass = attrs2ClassAry(processedAttrs.classAttrs);
  dataAttrs = processedAttrs.dataAttrs;
  clsAry = clsAry.concat(attrsClass);
  return {
    classes: clsAry,
    dataAttrs: dataAttrs
  };
}


/**
 * 单元格内的html转换成相应的operators，即cs
 * @param  {[type]} srcDom      [description]
 * @return {[type]}             [description]
 */
function html2Cs(srcDom, row, col, curDoc, newCellAttrs){
  var tempWrap = document.createElement('div'),
    children, childrenOps,
    oldCellAttrs, oldCellOpsLen,
    newCs, defaultAlign,
    srcDomType;

  tempWrap.innerHTML = srcDom;
  children = $(tempWrap).contents();
  oldCellAttrs = csTools.getCellCsAttrs(row, col, curDoc) || {};
  oldCellOpsLen = csTools.getCellDeltaLen(row, col, curDoc);

  if(newCellAttrs){
    for(var key in oldCellAttrs){
      if(!newCellAttrs[key]){
        newCellAttrs[key] = null;
      }
    }
    oldCellAttrs = newCellAttrs;
  }

  if(oldCellAttrs.formula){
    //如果之前该单元格是公式，现在不是
    oldCellAttrs.formula = null;
  }

  //default align logic: string->left, number->right, image->center
  if(!oldCellAttrs.align && srcDom){
    srcDomType = domUtils.getHtmlTextType(srcDom);
    defaultAlign = DEFAULT_ALIGN_MAP[srcDomType];
    if( defaultAlign && defaultAlign !== 'left' ){
      oldCellAttrs.align = defaultAlign;
    }
  }

  childrenOps = _.map(children, _html2TextOps);
  if(oldCellOpsLen > 0){
    childrenOps.push(csTools.genRemoveOps(oldCellOpsLen));
  }

  newCs = csTools.genNewCellCs(childrenOps);
  return newCs.set({ attributes: oldCellAttrs });

  /**
   * 将span的html转化成TextOperator
   * @return {[type]} [description]
   */
  function _html2TextOps(dom){
    var _tagAttrs = _.invert(TAG_ATTRS),
      domTag, tagVal, 
      opsData, opsAttrs = {}, ops;
    if(dom.nodeType == 3){
      opsData = _.escape(dom.nodeValue);
    }else if(dom.nodeType == 1){
      //tag
      domTag = dom.tagName.toLowerCase();
      if(domTag in _tagAttrs){
        if(domTag == 'a'){
          tagVal = $(dom).attr('href');
          opsAttrs[_tagAttrs[domTag]] = tagVal;
          opsData = $(dom).text();
        }else if(domTag == 'img'){
          opsData = {
            image: $(dom).attr('src')
          };
        }
      }else if(domTag == 'br'){
        opsData = '\n';
      }
    }

    ops = new TextOperator({
      action: 'insert',
      data: opsData
    });
    if(Object.keys(opsAttrs).length > 0){
      ops = ops.set({ attributes: opsAttrs });
    }
    return ops;
  }
}


/**
 * 将formula转成cs
 */
function formula2Cs(formula, row, col, curDoc){
  var oldCellOpsLen, cs, 
    cellOps = [];

  oldCellOpsLen = csTools.getCellDeltaLen(row, col, curDoc);
  if(oldCellOpsLen){
    cellOps = new Delta([csTools.genRemoveOps(oldCellOpsLen)]);
  }
  cs = new CellOperator({
    action: 'retain',
    data: cellOps,
    attributes: {
      formula: formula
    }
  });

  return cs;
}


/**
 * 根据td收集其所有的attrs
 * @param  {[type]} td [description]
 * @return {[type]}    [description]
 */
function collabTdAttrs(td) {
  var tdCls, tdDataAttrs;
  tdCls = _.toArray(td.classList);
  tdDataAttrs = $(td).data();

  if(tdDataAttrs.fontSize) {
    tdDataAttrs['font-size'] = tdDataAttrs.fontSize;
    delete tdDataAttrs.fontSize;
  }

  return function (type){
    var attrs, clsAttrs;
    if(type == 'cellProperties'){
      return {
        classes: tdCls,
        dataAttrs: tdDataAttrs
      };
    }

    clsAttrs = class2Attrs(tdCls);
    attrs = _.assign(clsAttrs, tdDataAttrs);
    return attrs;
  };
}







