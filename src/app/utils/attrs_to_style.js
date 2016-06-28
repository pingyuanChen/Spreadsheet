module.exports = {
    cellAttrs:{
        'font-size': getFontSize,
        'background': getBackground,
        'color': getFontColor,
        'bold': getBold,
        'italic': getItalic,
        'underline': getUnderline,
        'strike': getStrike,
        'vertical': getVertical,
        'wrap': getWrap,
        'align': getAlign
    }
}

var config = {
    'font-size': [9, 10, 11, 12, 14, 18, 24, 30, 36],
    'color': ["#ffffff", "#595856", "#fcdbd6", "#fff0cf", "#d4e9d6", "#cee0ef", "#dfdbec", "#f3f3f1", "#41464b", 
              "#ee837d", "#e6b322", "#9abd9d", "#89b0ce", "#9389b1", "#c1c6ca", "#2b2b2b", "#d51228", "#8d634a", 
              "#557b5c", "#3776a6", "#765c83", "#adadad", "#0d0015", "#a91913", "#563725", "#00552e", "#194e77", 
              "#530e6f", "#fe2c23", "#ff9900", "#ffd900", "#a3e043", "#37d9f0", "#4da8ee", "#aa17d0", "#949494", 
              "#fde9d0", "#def3f3", "#dcdedd", "#f8c387", "#83ccd2", "#cf770b", "#01a3b0", "#884702", "#00767a"],
    'border':["#e2e2e2", "#504f4e", "#dfc2bd", "#e2d5b8", "#bccebd", "#b7c7d4", "#c6c2d1", "#d8d8d6", "#393e43", 
              "#d3746f", "#cfa11f", "#88a88b", "#799cb7", "#82799d", "#abafb3", "#262626", "#bc1024", "#7d5842", 
              "#4b6d52", "#316893", "#685274", "#9c9c9c", "#07000c", "#961711", "#4c3121", "#004b28", "#174569", 
              "#490c62", "#e52820", "#e68a00", "#e6c400", "#93ca3c", "#32c4d8", "#4598d7", "#9915bc", "#858585", 
              "#e4d2bc", "#c8dbdb", "#c6c8c7", "#e0b07a", "#76b8bd", "#bb6b0a", "#01939f", "#7b4002", "#006a6e"]
}
function getFontSize(value) {
    if(config['font-size'].indexOf(+value) < 0) {
      value = 9;
    }
    return 'font-size:' + Math.round(value*1.33333) + 'px';
}

function getFontColor(value) {
    return 'color:' + config['color'][value-1];
}

function getBackground(value) {
    return 'background:' + config['color'][value-1] + ';border-color:' + config['border'][value-1];
}

function getAlign(value) {
    return 'text-align:' + value;
}

function getBold() {
    return 'font-weight:700';
}

function getItalic() {
    return 'font-style:italic';
}

function getUnderline() {
    return 'text-decoration:underline';
}

function getStrike() {
    return 'text-decoration:line-through';
}

function getVertical(value) {
    return 'vertical-align:' + value;
}

function getWrap(value) {
    if (value === 'text-no-wrap') {
        return 'white-space: nowrap';
    }
}
