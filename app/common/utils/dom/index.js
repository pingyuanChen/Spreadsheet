
function qsa(selector, element = document) {
  const classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    tagSelectorRE = /^[\w-]+$/;
  let found;

  return (idSelectorRE.test(selector)) ?
    (found = element.getElementById(RegExp.$1)) ? [found] : [] :
    (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
    [].slice.call(
      classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
      tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
      element.querySelectorAll(selector)
    );
}

/**
 * 删除当前dom节点
 * @param  {[type]} elem [description]
 * @return {[type]}      [description]
 */
function delNode(elem) {
  if (elem && elem.nodeName && elem.parentNode) {
    elem.parentNode.removeChild(elem);
  }
}

function hasClass(elems, value) {
  if (!elems) {
    return false;
  }
  if (!_.isArray(elems)) {
    elems = [elems];
  }
  _(elems).forEach((elem) => {
    const className = ' ' + value + ' ',
      classNames = ' ' + elem.className + ' ';
    if (elem.nodeType === 1) {
      if (classNames.indexOf(className) > -1) {
        return true;
      }
    }
  });
  return false;
}

function addClass(elems, value) {
  if (!elems) {
    return false;
  }
  if (!_.isArray(elems)) {
    elems = [elems];
  }
  _(elems).forEach((elem) => {
    const classNames = value.split(' ');
    if (elem.nodeType === 1) {
      if (!elem.className && classNames.length === 1) {
        elem.className = value;
      } else {
        let setClass = ' ' + elem.className + ' ';
        for (let c = 0, cl = classNames.length; c < cl; c++) {
          if (setClass.indexOf(' ' + classNames[c] + ' ') < 0) {
            setClass += classNames[c] + ' ';
          }
        }
        elem.className = setClass.replace(/^\s+|\s+$/g, '');
      }
    }
  });
}

function removeClass(elems, value) {
  if (!elems) {
    return false;
  }
  if (!_.isArray(elems)) {
    elems = [elems];
  }
  _(elems).forEach((elem) => {
    if (value === undefined) {
      elem.className = '';
      return;
    }

    const removeCls = value.split(' '),
      classNames = elem.className.split(' ');

    if (elem.nodeType === 1) {
      for (let i = 0, l = classNames.length; i < l; i++) {
        if (removeCls.indexOf(classNames[i]) > -1) {
          classNames[i] = '';
        }
      }
    }
    elem.className = classNames.join(' ').trim();
  });
}

function empty(elems) {
  _(elems).forEach((elem) => {
    elem.innerHTML = '';
  });
}

function append() {
  
}

export default {
  qsa: qsa,
  delNode: delNode,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  empty: empty,
  append: append
};

