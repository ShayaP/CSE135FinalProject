let token = JSON.parse(localStorage.getItem('token'));

// Check whether valid cookie is set and get new one otherwise
fetch(
  '/tracker',
  {
    method: 'GET',
    credentials: 'include'
  }
)
  .catch(error => {
    console.error('Error:', error);
  });


let pauseCount = 0;
let idleCount = 0;

// Object to store in localstorage
let report = {
  mouseClickEvents: [],
  mouseMoveEvents: [],
  keyEvents: [],
  scrollEvents: [],
  beforeunload: {},
  language: '',
  userAgent: '',
  maxScreenHeight: '',
  maxScreenWidth: '',
  currScreenHeight: '',
  currScreenWidth: '',
  effectiveConnectionType: '',
  cookieEnabled: false,
  imagesEnabled: false,
  cssEnabled: false,
  JSEnabled: true,
  resourceTiming: [],
  navTiming: {},
  totalTime: 0,
  idleCount: 0
};

// increment pause counter every millisecond.
this.setInterval(() => {
  pauseCount += 1;
  if (pauseCount > 2000) {
    idleCount += 1;
  }
}, 1);

window.onload = function() {
  report.cookieEnabled = window.navigator.cookieEnabled;
  report.language = window.navigator.language;
  report.userAgent = window.navigator.userAgent;
  report.maxScreenHeight = window.screen.availHeight;
  report.maxScreenWidth = window.screen.availWidth;
  report.currScreenWidth = window.screen.width;
  report.currScreenHeight = window.screen.height;
  report.effectiveConnectionType = window.navigator.connection.effectiveType;

  // Check if images are on
  function imagesAllowed() {
    report.imagesEnabled = true;
  }

  function imagesOff() {
    report.imagesEnabled = false;
  }
  let tester = new Image();
  tester.onload = imagesAllowed;
  tester.onerror = imagesOff;
  tester.src = './media/atheris1.jpg';

  // Check if css is on
  let tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  document
    .getElementsByTagName('body')
    .item(0)
    .appendChild(tempDiv);
  let style;
  if (tempDiv.currentStyle) {
    style = tempDiv.currentStyle['position'];
  } else if (window.getComputedStyle) {
    style = document.defaultView
      .getComputedStyle(tempDiv, null)
      .getPropertyValue('position');
  }
  report.cssEnabled = style == 'absolute' ? true : false;
  document
    .getElementsByTagName('body')
    .item(0)
    .removeChild(tempDiv);

  // Check if js is enabled
  if (document.getElementsByTagName('noscript').item(0)) {
    report.JSEnabled = false;
  }
};

window.addEventListener('click', e => {
  // Get rid of non-enumerable properties.
  let props = [
    'x',
    'y',
    'clientX',
    'clientY',
    'layerX',
    'layerY',
    'ctrlKey',
    'shiftKey',
    'altKey',
    'metaKey',
    'pageX',
    'pageY',
    'offsetX',
    'offsetY',
    'movementX',
    'movementY',
    'timeStamp',
    'returnValue',
    'screenX',
    'screenY'
  ];
  props.forEach(prop => {
    Object.defineProperty(e, prop, {
      value: e[prop],
      enumerable: true,
      configurable: true
    });
  });

  report.mouseClickEvents.push(e);
  pauseCount = 0;
});

window.addEventListener('keyup', e => {
  // Get rid of non-enumerable properties.
  let props = [
    'ctrlKey',
    'shiftKey',
    'altKey',
    'metaKey',
    'timeStamp',
    'returnValue',
    'key',
    'code',
    'charCode',
    'keyCode',
    'location',
    'which',
    'type',
    'defaultPrevented',
    'cancelable'
  ];
  props.forEach(prop => {
    Object.defineProperty(e, prop, {
      value: e[prop],
      enumerable: true,
      configurable: true
    });
  });
  report.keyEvents.push(e);
  pauseCount = 0;
});

window.addEventListener('scroll', e => {
  // Get rid of non-enumerable properties.
  let props = [
    'timeStamp',
    'returnValue',
    'type',
    'defaultPrevented',
    'cancelable',
    'bubbles'
  ];
  props.forEach(prop => {
    Object.defineProperty(e, prop, {
      value: e[prop],
      enumerable: true,
      configurable: true
    });
  });
  report.scrollEvents.push(e);
  pauseCount = 0;
});

window.addEventListener('mousemove', e => {
  // Get rid of non-enumerable properties.
  let props = [
    'x',
    'y',
    'clientX',
    'clientY',
    'layerX',
    'layerY',
    'ctrlKey',
    'shiftKey',
    'altKey',
    'metaKey',
    'pageX',
    'pageY',
    'offsetX',
    'offsetY',
    'movementX',
    'movementY',
    'timeStamp',
    'returnValue',
    'screenX',
    'screenY'
  ];
  props.forEach(prop => {
    Object.defineProperty(e, prop, {
      value: e[prop],
      enumerable: true,
      configurable: true
    });
  });
  report.mouseMoveEvents.push(e);
  pauseCount = 0;
});

window.addEventListener('beforeunload', e => {
  // Get rid of non-enumerable properties.
  let props = [
    'timeStamp',
    'returnValue',
    'type',
    'defaultPrevented',
    'cancelable',
    'bubbles'
  ];
  props.forEach(prop => {
    Object.defineProperty(e, prop, {
      value: e[prop],
      enumerable: true,
      configurable: true
    });
  });

  // Timing info
  report.resourceTiming = window.performance.getEntriesByType('resource');
  report.navTiming = window.performance.getEntries()[0];
  report.totalTime =
    report.navTiming.responseEnd - report.navTiming.requestStart;
  report.beforeunload = e; // before unload
  report.idleCount = idleCount; // idle count

  let today = new this.Date();
  var date =
    today.toLocaleDateString() +
    ' ' +
    today.getHours() +
    ':' +
    today.getMinutes();
  let currLoc = window.location.pathname;
  let sessionID = currLoc + ' ' + date;
  let data = {
    url: sessionID,
    report: report
  };

  navigator.sendBeacon(
    '/collect',
    JSON.stringify(data)
  );
});
