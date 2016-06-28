var langUtils = require('./lang');

var linkReg = /<a [^>]+>([^<]+)<\/a>/;

/**
 * 获取dom的html，不是innerHTML
 */
function getDomHtml(str){
  var tempContainer = $('<div></div>');
  tempContainer.append(str);
  return tempContainer.html();
}

function getDomText(str){
  var tempContainer = $('<div></div>');
  tempContainer.append(str);
  return tempContainer.text();
}


/**
 * 获取tag的文本，不包括其子元素的文本
 */
function getTagText(dom){
  dom = $(dom);
  return dom.clone().children().remove().end().text();
}


/**
 * 获取dom中最长文本的长度
 */
function getDomTextWidth(dom){
  var width,
    children = $(dom).contents(),
    itemWidth, widthAry = [], maxIndex, maxDom, maxStr;
  _.forEach(children, function(item){
    if(item.nodeType == 3){
      itemWidth = langUtils.strLen(item.nodeValue);
    }else if(getTagName(item) == 'div'){
      itemWidth = langUtils.strLen(item.textContent);
    }else{
      itemWidth = 0;
    }
    widthAry.push(itemWidth);
  })
  width = _.max(widthAry);
  maxIndex = _.indexOf(widthAry, width);
  maxDom = children[maxIndex];
  if(maxDom && maxDom.nodeType == 3){
    maxStr = maxDom.nodeValue;
  }else if(maxDom && getTagName(maxDom) == 'div'){
    maxStr = maxDom.textContent;
  }else{
    maxStr = '';
  }

  return {
    maxLen: width,
    maxStr: maxStr
  }
}



function isHtml(str){
  // var htmlReg = /^<(\w+)(\s+[^>]*)?((\/?>)|(>([^<>]*)<\/\1>))$/;

  // 上一个正则表达式无法识别标签嵌套的情况，例如<td><br></td>，或者xx<a></a>xx
  // 修改于2016.2.29 by xp
  var htmlReg = /<[a-z][\s\S]*>/i;

  return htmlReg.test(str);
}

function isUrl(str){
  var v4 = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}';
  var protocol = '(?:(?:https?|ftp|ssh):\/\/)';
  var auth = '(?:\\S+(?::\\S*)?@)?';
  var ip = new RegExp(v4, 'g').source;
  var host = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)';
  var domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
  var tld = '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))';
  var port = '(?::\\d{2,5})?';
  var path = '(?:[/?#][^\\s"]*)?';
  var regex = [
    protocol, auth, '(?:localhost|' + ip + '|' + host + domain + tld + ')',
    port, path
  ].join('');

  var urlReg = new RegExp('(?:^' + regex + '$)', 'i');
  str = str.trim();
  return urlReg.test(str);
}

function urlify(str){
  var href, unescapeStr;
  if(isUrl(str)){
    href = str.trim();
    if(href.indexOf('http') !== 0){
      href = 'http://'+href;
    }
    return str = '<a href="'+href+'" target="_blank">'+str+'</a>';
  }else{
    unescapeStr = _.unescape(str);
    if (linkReg.test(unescapeStr)) {
      return urlify(extractTextFromLink(unescapeStr));
    } else {
      return str;
    }
  }
}

function extractTextFromLink (linkStr) {
  return linkStr.match(linkReg)[1];
}

function isImage(str){
  var imgReg = /<img\s+src\s*=\s*(["'][^"']+["']|[^>]+)>/;
  return imgReg.test(str);
}

function getTagName(dom){
  if(!dom || dom.nodeType == 3){
    return '';
  }
  return dom.tagName.toLowerCase();
}

/**`
 * 获取html中text的类型：number, string, img
 * @param  {[type]} text [description]
 * @return {[type]}      [description]
 */

/**
 * WARNING: 直接tempWrap.innerHTML赋值来判断类型很危险，以后用到这个或类似API时需要换一个方式。
 */

function getHtmlTextType(text){
  var tempWrap, type = 'string';
  
  if (isHtml(text)) {
    tempWrap = document.createElement('div');
    tempWrap.innerHTML = text;
    if($(tempWrap).find('img').length > 0){
      type = 'image';
    }
  } else if(_.isNumber(text) || text.search(/^\$?\d+(,\d{3})*(\.\d*)?$/) >= 0){
    type = 'number';
  }
  return type;
}


module.exports = {
  getDomHtml: getDomHtml,
  getDomText: getDomText,
  getTagName: getTagName,
  getTagText: getTagText,
  getDomTextWidth: getDomTextWidth,
  getHtmlTextType: getHtmlTextType,
  isHtml: isHtml,
  isUrl: isUrl,
  urlify: urlify,
  isImage: isImage
};

