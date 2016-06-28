var richdoc           = require('richdoc');
var CellOperator      = richdoc.CellOperator;
var ParagraphOperator = richdoc.ParagraphOperator;
var TextOperator      = richdoc.TextOperator;

var contants;

module.exports = contants = {
  MAP: {
    'CellOperator': 'div',
    'ParagraphOperator': 'p',
    'TextOperator': 'span'
  },
  OP_MAP: {
    'div': CellOperator,
    'p': ParagraphOperator,
    'span': TextOperator
  },
  CLASS_ATTRS: {
    's-formula-cell': 'formula',
    'italic': 'italic',
    'bold': 'bold',
    'strike': 'strike',
    'underline': 'underline',
    'link': 'link'
  },
  MULTI_CLASS_ATTRS: {
    'format': ['text', 'number', 'percent', 'currency', 'date', 'time', 'date-time'],
  },
  DATA_ATTRS: [
    'rowspan', 'colspan', 'color', 'background', 'font-size',
    'format', 'vertical', 'align', 'wrap'],
  TAG_ATTRS: {
    'link': 'a',
    'image': 'img'
  },
  TEMPLATE: {
    'link': '<a href="<%= link %>" target="_blank"><%= content %></a>',
    'italic': '<em><%= content %></em>',
    'bold': '<strong><%= content %></strong>',
    'strike': '<s><%= content %></s>',
    'underline': '<u><%= content %></u>',
    'image': '<img src="<%= image %>">'
  },
  DEFAULT_ALIGN_MAP: {
    'string': 'left',
    'image': 'center',
    'number': 'right'
  },
  DEFAULT_ATTRS: {
    'font-size': 0,
    'color': 15,
    'background': 0,

    'align': 'left',
    'vertical': 'middle',
    'wrap': 'text-wrap',

    'bold': false,
    'italic': false,
    'strike': false,
    'underline': false
  },

  getAllClass: getAllClass,
  getAllDataAttrs: getAllDataAttrs,
  getAllDefaultAttrs: getAllDefaultAttrs
};

/**
 * 获取所有默认的单元格属性
 */
function getAllDefaultAttrs(){
  return contants.DEFAULT_ATTRS;
}

/**
 * 获取需被cs处理的所有class
 * @return {[type]} [description]
 */
function getAllClass(){
  return Object.keys(contants.CLASS_ATTRS);
}

/**
 * 获取所有data-xxx类型的attribute
 */
function getAllDataAttrs(){
  return contants.DATA_ATTRS;
}
