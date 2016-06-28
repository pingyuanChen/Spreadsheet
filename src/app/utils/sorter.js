var domUtils = require('./dom');

module.exports = {
  defaultSort: defaultSort,
  dateSort: dateSort
}

function defaultSort(sortOrder) {
  return function(a, b) {
    a0 = a[0];
    b0 = b[0];
    a = getText(a[1]);
    b = getText(b[1]);
    

    //number
    if (_.isNumber(a) && _.isNumber(b) && a < b) {
      return sortOrder ? -1 : 1;
    }
    if (_.isNumber(a) && _.isNumber(b) && a > b) {
      return sortOrder ? 1 : -1;
    }

    // number vs string
    if(_.isNumber(a) && !_.isNumber(b)){
      return -1;
    }
    if(!_.isNumber(a) && _.isNumber(b)){
      return 1;
    }


    if (typeof a == 'string') {
      a = a.toLowerCase();
    }
    if (typeof b == 'string') {
      b = b.toLowerCase();
    }

    if(a != '' && b == ''){
      return -1;
    }
    if(a == '' && b != ''){
      return 1;
    }


    if (a === b) {
      if(a0 > b0){
        return 1;
      }else{
        return -1;
      }
    }

    if (a < b) {
      return sortOrder ? -1 : 1;
    }
    if (a > b) {
      return sortOrder ? 1 : -1;
    }


    return 0;
  };
}

function getText(str){
  if(domUtils.isHtml(str)){
    str = $(str).text().trim();
  }
  if(!isNaN(parseInt(str, 10))){
    str = parseInt(str, 10);
  }
  return str;
}


function dateSort(sortOrder) {
  return function(a, b) {
    if (a === b) {
      return 0;
    }
    if (a === null || a === '') {
      return 1;
    }
    if (b === null || b === '') {
      return -1;
    }

    var aDate = new Date(a);
    var bDate = new Date(b);

    if (aDate < bDate) {
      return sortOrder ? -1 : 1;
    }
    if (aDate > bDate) {
      return sortOrder ? 1 : -1;
    }

    return 0;
  };
}

