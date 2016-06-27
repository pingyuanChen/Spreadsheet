
function newXmlHttp() {
  let xmlHttp;
  if (window.XMLHttpRequest) {
    xmlHttp = new XMLHttpRequest();
  } else {
    xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
  }
  return xmlHttp;
}

function ajaxGet(url) {
  const xmlHttp = newXmlHttp();
  xmlHttp.open('GET', url, true);
  xmlHttp.send();
  return new Promise((resolve, reject) => {
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          resolve(JSON.parse(xmlHttp.responseText));
        } else {
          reject(xmlHttp.responseText);
        }
      }
    };
  });
}

function ajaxPost(url, data) {
  const xmlHttp = newXmlHttp();
  xmlHttp.open('POST', url);
  xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  if (window.cow._csrf) {
    xmlHttp.setRequestHeader('X-CSRF-Token', window.cow._csrf);
  }
  let queryString = '';
  Object.keys(data).forEach(function (key) {
    queryString += `${key}=${data[key]}&`;
  });
  xmlHttp.send(queryString);
  return new Promise((resolve, reject) => {
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          let repData;
          try {
            repData = JSON.parse(xmlHttp.responseText);
          } catch (error) {
            repData = xmlHttp.responseText;
          }
          resolve(repData);
        } else {
          reject(xmlHttp.responseText);
        }
      }
    };
  });
}

export default {
  ajaxGet: ajaxGet,
  ajaxPost: ajaxPost
};

