/**
* 序列化字符串值
* @param {String} str 需要序列化的值
* @return {Object} hash对象
*/
function getStringParams(str) {
  if (!str) {
    return {};
  }
  const _input = 'string' === typeof str ? str : '',
    _paras = _input.split('&'),
    result = {};
  let i, l, tmp;
  for (i = 0, l = _paras.length; i < l; i++) {
    tmp = _paras[i].split('=');
    result[tmp[0]] = tmp[1] || '';
  }
  return result;
}

function getQueryParams() {
  const queryStr = window.location.search.slice(1);
  return getStringParams(queryStr);
}

export default {
  getQueryParams: getQueryParams
};
