document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems, {coverTrigger: false, constrainWidth: false});
  });

document.addEventListener("DOMContentLoaded", refreshData);

var dbObject;

let chartFontColor = "#8e99a9";

function refreshData() {
  fetch('/query')
    .then(response => {
      return response.json();
    })
    .then(json => {
      render(json);
    });
}

function render(json) {
  dbObject = json;
  renderBrowserChart(dbObject);
  renderLanguageChart(dbObject);
  renderFeatureChart(dbObject);
}

function getUserListData(db) {
  let list = [];
  Object.keys(db).forEach((element) => {
    list.push(db[element]);
  });
  return list;
}

function getSitesArray(db) {
  let users = getUserListData(db);
  let list = [];
  users.forEach((user) => {
    Object.keys(user).forEach((element) => {
      list.push(user[element]);
    })
  })
  return list;
}

function getBrowser(userAgent) {
  // Inspired by code from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser 
  if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) 
  {
      return 'Opera';
  }
  else if(navigator.userAgent.indexOf("Chrome") != -1 )
  {
      return 'Chrome';
  }
  else if(navigator.userAgent.indexOf("Safari") != -1)
  {
      return 'Safari';
  }
  else if(navigator.userAgent.indexOf("Firefox") != -1 ) 
  {
      return 'Firefox';
  }
  else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
  {
    return 'IE';
  }  
  else 
  {
    return 'other';
  }
}

function getBrowserData(dbObject) {
  let pages = getSitesArray(dbObject);

  let browsers = pages.map(element => element.userAgent)
                      .map(getBrowser);

  let browserCount = {};

  browsers.forEach((browser) => {
    if (!browserCount.hasOwnProperty(browser)) {
      browserCount[browser] = 1;
    } else {
      browserCount[browser] += 1;
    }
  });
  return browserCount;
}

function renderPieChart(data, chartName, title) {
  let colors = ['#50ADF5','#FF7965','#FFCB45','#6877e5','#6FB07F'];
  let colorIndex = 0;

  let series = [];

  Object.keys(data).forEach((key) => {
    series.push({
      values : [data[key]],
      text: key,
      backgroundColor: colors[(colorIndex++)%colors.length]
    });
  })

  let browserChartConfig = {
    type: "pie",
    backgroundColor: "transparent",
    plot: {
      borderColor: "#2B313B",
      borderWidth: 2,
      // slice: 90,
      valueBox: {
        placement: 'out',
        text: '%t\n%npv%',
        fontFamily: "Open Sans"
      },
      tooltip:{
        fontSize: '18',
        fontFamily: "Open Sans",
        padding: "5 10",
        text: "%npv%"
      }
    },
    title: {
      fontColor: chartFontColor,
      text: title,
      align: "left",
      offsetX: 10,
      //fontFamily: "Sans",
      fontSize: 20
    },
    plotarea: {
      margin: "20 0 0 0"  
    },
    series : series
 };
  
 zingchart.render({ 
   id : chartName, 
   data : browserChartConfig, 
   height: 400, 
   width: 600 
 });
}

function renderBrowserChart(dbObject) {
  console.log(dbObject);
  let browserCount = getBrowserData(dbObject);
  renderPieChart(browserCount, 'browser-chart', 'Page Loads by Browser');
}

function getLanguageData(db) {
  let pages = getSitesArray(dbObject);

  let languages = pages.map(element => element.language);

  let languageCount = {};

  languages.forEach((language) => {
    if (!languageCount.hasOwnProperty(language)) {
      languageCount[language] = 1;
    } else {
      languageCount[language] += 1;
    }
  });
  return languageCount;
}

function renderLanguageChart(dbObject) {
  let languageCount = getLanguageData(dbObject);

  renderPieChart(languageCount, 'language-chart', 'Page Loads by Language');
}

function getFeaturesData(dbObject) {
  let pages = getSitesArray(dbObject);

  let totalClicks = pages.length;



  let languages = pages.map(element => element.language);

  let languageCount = {};

  languages.forEach((language) => {
    if (!languageCount.hasOwnProperty(language)) {
      languageCount[language] = 1;
    } else {
      languageCount[language] += 1;
    }
  });
  return languageCount;
}

function renderFeatureChart(dbObject) {
  let features = getFeaturesData(dbObject);

  renderBarChart(null, 'feature-chart', 'Enabled Features');
}

function renderBarChart(data, chartName, title) {
  let myConfig = {
    "graphset": [
          {
              "type": "bar",
              "background-color": "transparent",
              "title": {
                  "text": title,
                  "font-color": chartFontColor,
                  "backgroundColor": "none",
                  "font-size": "22px",
                  "alpha": 1,
                  "adjust-layout":true,
              },
              "plotarea": {
                  "margin": "dynamic"
              },
              "legend": {
                  "layout": "x3",
                  "overflow": "page",
                  "alpha": 0.05,
                  "shadow": false,
                  "align":"center",
                  "adjust-layout":true,
                  "marker": {
                      "type": "circle",
                      "border-color": "none",
                      "size": "10px"
                  },
                  "border-width": 0,
                  "maxItems": 3,
                  "toggle-action": "hide",
                  "pageOn": {
                      "backgroundColor": chartFontColor,
                      "size": "10px",
                      "alpha": 0.65
                  },
                  "pageOff": {
                      "backgroundColor": chartFontColor,
                      "size": "10px",
                      "alpha": 0.65
                  },
                  "pageStatus": {
                      "color": "black"
                  }
              },
              "plot": {   
                  "bars-space-left":0.15,
                  "bars-space-right":0.15,
                  "animation": {
                      "effect": "ANIMATION_SLIDE_BOTTOM",
                      "sequence": 0, 
                      "speed": 800,
                      "delay": 800
                  }
              },
              "scale-y": {
                  "line-color": chartFontColor,
                  "item": {
                      "font-color": chartFontColor
                  },
                  "values": "0:60:10",
                  "guide": {
                      "visible": true
                  },
                  "label": {
                    "text": "$ Billions",
                    "font-family": "arial",
                    "bold": true,
                    "font-size": "14px",
                    "font-color": chartFontColor,
                  },
              },
              "scaleX":{
                  "values": [
                      "Q3",
                      "Q4",
                      "Q1",
                      "Q2"
                  ],
                  "placement":"default",
                  "tick":{
                      "size":58,
                      "placement":"cross"
                  },
                  "itemsOverlap":true,
                  "item":{
                      "offsetY":-55
                  }
              },
              "scaleX2":{
                  "values":["2013","2014"],
                  "placement":"default",
                  "tick":{
                      "size":20,
                  },
                  "item":{
                      "offsetY":-15
                  }
              },
              "tooltip": {
                "visible": false
              },
              "crosshair-x":{
                  "line-width":"100%",
                  "alpha":0.18,
                  "plot-label":{
                    "header-text":"%kv Sales"
                  }
              },
              "series": [
                  {
                      "values": [
                          37.47,
                          57.59,
                          45.65,
                          37.43
                      ],
                      "alpha": 0.95,
                      "borderRadiusTopLeft": 7,
                      "background-color": "#8993c7",
                      "text": "Apple",
                  },
                  {
                      "values": [
                          2.02,
                          2.59,
                          2.5,
                          2.91
                      ],
                      "borderRadiusTopLeft": 7,
                      "alpha": 0.95,
                      "background-color": "#fdb462",
                      "text": "Facebook"
                  },
                  {
                      "values": [
                          13.4,
                          14.11,
                          14.89,
                          16.86
                      ],
                      "alpha": 0.95,
                      "borderRadiusTopLeft": 7,
                      "background-color": "#8dd3c7",
                      "text": "Google"
                  },
                  {
                      "values": [
                          18.53,
                          24.52,
                          20.4,
                          23.38
                      ],
                      "borderRadiusTopLeft": 7,
                      "alpha": 0.95,
                      "background-color": "#fb8072",
                      "text": "Microsoft"
                  },
                  {
                      "values": [
                          17.09,
                          25.59,
                          19.74,
                          19.34
                      ],
                      "borderRadiusTopLeft": 7,
                      "alpha": 0.95,
                      "background-color": "#80b1d3",
                      "text": "Amazon"
                  },
                  {
                      "values": [
                          2.31,
                          2.36,
                          2.42,
                          2.52
                      ],
                      "borderRadiusTopLeft": 7,
                      "alpha": 0.95,
                      "background-color": "#b3de69",
                      "text": "Cognizant"
                  }
              ]
          }
      ]
  };

  zingchart.render({ 
    id : chartName, 
    data : myConfig, 
    height: 600, 
    width: 400 
  });
}