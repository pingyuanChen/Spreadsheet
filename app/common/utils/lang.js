export function assign(target, ...sources) {
  const args = [...arguments];
  if (Object.assign) {
    return Object.assign.apply(null, args);
  }
  return extend.apply(null, args);
}

export function extend(target, ...sources) {
  let i = 1,
    key, cur;
  if (target === undefined || target === null) {
    target = {};
  }
  cur = arguments[i];
  while (cur) {
    for (key in cur) {
      if (Object.prototype.hasOwnProperty.call(cur,key)) {
        target[key] = cur[key];
      }
    }
    cur = arguments[++i];
  }
  return target;
}