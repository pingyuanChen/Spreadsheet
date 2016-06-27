const attachFunctionList = {};
const processFunction = function (notifyName, callback, isDel) {
  if (typeof notifyName === 'string') {
    if (typeof callback === 'function') {
      // 如果传递了函数
      let len = (attachFunctionList[notifyName] || []).length;
      while (len--) {
        if (attachFunctionList[notifyName][len].fun === callback) {
          if (isDel === true) {
            // 如果是删除
            attachFunctionList[notifyName].splice(len, 1);
          } else {
            // 如果是获取
            return attachFunctionList[notifyName][len];
          }
        }
      }
    } else {
      // 如果没有传递函数
      const isDel = !! callback;
      if (isDel === true) {
        // 如果传递了删除值，则删除
        delete attachFunctionList[notifyName];
      } else {
        // 否则直接返回对应的绑定函数列表
        return attachFunctionList[notifyName];
      }
    }
  }
  return null;
};

// 监听消息
// @param {String} notifyName
// @param {Function} callback
// @param {Object} [options] 选项
// @param {Object} options.scope 作用域
// @param {Boolean} options.isAsync 是否异步执行
const attach = function (notifyName, callback, options) {
  const opt = options || {};
  if (typeof notifyName === 'string' && typeof callback === 'function') {
    const _temp = processFunction(notifyName);
    if (!_temp) {
      attachFunctionList[notifyName] = [];
    }
    processFunction(notifyName).push({
      fun: callback,
      scope: opt.scope,
      isAsync: opt.isAsync
    });
  }
};

// 解绑消息
// @param {Object} notifyName
// @param {Object} callback
const detach = function (notifyName, callback) {
  if (typeof notifyName !== 'string') {
    return;
  }

  if (typeof callback === 'function') {
    processFunction(notifyName, callback, true);
  } else {
    processFunction(notifyName, true);
  }
};

// 监听唯一消息
// @param {String} notifyName
// @param {Function} callback
// @param {Object} [options] 选项
// @param {Object} options.scope 作用域
// @param {Boolean} options.isAsync 是否异步执行
const attachOne = function (notifyName, callback, options) {
  detach(notifyName);
  attach(notifyName, callback, options);
};

// 通知消息
// @param {Object} notifyName
const notify = function (notifyName) {
  const funs = processFunction(notifyName) || [];
  const len = funs.length;
  if (len === 0) {
    return;
  }

  const args = Array.prototype.slice.call(arguments, 1);
  for (let i = 0; i < funs.length; i++) {
    if (funs[i].isAsync) {
      (function (t) {
        setTimeout(function () {
          t.fun.apply(t.scope, args);
        }, 0);
      })(funs[i]);
    } else {
      try {
        funs[i].fun.apply(funs[i].scope, args);
      } catch(e) {
        console.error(e.stack);
      }
    }
  }
};

export default {
  on: attach,
  off: detach,
  attach: attach,
  detach: detach,
  notify: notify,
  attachOne: attachOne
};
