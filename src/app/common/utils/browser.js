var ua = window.navigator.userAgent.toLowerCase();

/**
 * 判断是否为FireFox浏览器
 */
function isFireFox() {
  return /firefox/.test(ua)
}

module.exports = {
  isFireFox: isFireFox
};
