module.exports = {
  strLen: strLen,
  mapKeys: mapKeys,
  unescapeHTML: unescapeHTML
};

/**
 * get string length: chinese is twice english
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function strLen(str){
  var len = 0, charCode;
  for(var i=0,l=str.length; i<l; i++){
    charCode = str.charCodeAt(i);
    if(charCode >= 0 && charCode <= 255){
      len++;
    }else{
      len += 2;
    }
  }
  return len;
}


function mapKeys(obj, iteratee){
  var result = {}, newKey;
  for(var key in obj){
    newKey = iteratee(obj[key], key);
    result[newKey] = obj[key];
  }
  return result;
}


function unescapeHTML(str){
  return str
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/&amp;/gi, "&")
          .replace(/&quot;/gi, '"')
          .replace(/&apos;/gi, "'"); 
}