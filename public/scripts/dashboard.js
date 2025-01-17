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

  renderDOMInteractiveChart(dbObject);
  renderTotalTimeChart(dbObject);
  renderResourceTimingChart(dbObject);
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

function getArrayBySite(db) {
  let users = getUserListData(db);
  let mapping = {};
  users.forEach((user) => {
    Object.keys(user).forEach((element) => {
      let mapKey = element.substr(0,element.indexOf(' '));
      if (!mapping.hasOwnProperty(mapKey)) {
        mapping[mapKey] = [];
      }
      mapping[mapKey].push(user[element]);
    })
  })
  return mapping;
}

function getBrowser(userAgent) {
  // Inspired by code from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser 
  if (typeof(userAgent) !== 'string') {
      return 'other';
  }
  if((userAgent.indexOf("Opera") || userAgent.indexOf('OPR')) != -1 ) 
  {
      return 'Opera';
  }
  else if(userAgent.indexOf("Chrome") != -1 )
  {
      return 'Chrome';
  }
  else if(userAgent.indexOf("Safari") != -1)
  {
      return 'Safari';
  }
  else if(userAgent.indexOf("Firefox") != -1 ) 
  {
      return 'Firefox';
  }
  else if((userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
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
   //height: , 
   width: "100%"
 });
}

function renderBrowserChart(dbObject) {
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

  // Get true false value for enabled
  let css = pages.map((element) => element.cssEnabled);
  let images = pages.map((element) => element.imagesEnabled);
  let javascript = pages.map((element) => element.JSEnabled);
  let cookies = pages.map((element) => element.cookieEnabled);

  // Convert true to 1 and false to 0
  css = css.map((val) => val ? 1 : 0);
  images = images.map((val) => val ? 1 : 0);
  javascript = javascript.map((val) => val ? 1 : 0);
  cookies = cookies.map((val) => val ? 1 : 0);

  // Sum up the 1s
  css = css.reduce((x,y) => x + y);
  images = images.reduce((x,y) => x + y);
  javascript = javascript.reduce((x,y) => x + y);
  cookies = cookies.reduce((x,y) => x + y);

  css = css / totalClicks * 100;
  images = images / totalClicks * 100;
  javascript = javascript / totalClicks * 100;
  cookies = cookies / totalClicks * 100;

  let data = [css, images, cookies, javascript];
  let labels = ["CSS", "Images", "Cookies", "JS"];
  return [data, labels];
}

function renderFeatureChart(dbObject) {
  let [data, labels] = getFeaturesData(dbObject);
  renderBarChart(data, 'feature-chart', labels, 'Enabled Features');
}

function renderBarChart(data, chartName, labels, title) {
  let fullBar = [];
  for (let i = 0; i < data.length; i++) {
    fullBar.push(100);
  }
  let myConfig = {
    "graphset":[
        {
            "title": {
              "fontColor": chartFontColor,
              "text": title,
              "align": "left",
              "offsetX": 10,
              "fontSize": 20
            },
            "offsetX": 40,
            "background-color": "transparent",
            "type":"hbar",
            "plot":{
                "stacked":true
                },
            "scaleX":{
                "labels": labels,
                },
            "scaleY":{
                "minValue":0,
                "maxValue":100,
                "decimals":1,
                "visible": false
                },
            "series":[
                {
                    "values":data,
                    "backgroundColor":'#50ADF5',
                    "legend-text": "Enabled",
                    "tooltip":{
                      "text":"%v\%",
                      "textAlign":"left",
                      "decimals": 1
                    },
                    "valueBox":{
                        "placement":"middle",
                        "color": "#ffffff",
                        "text": "%v\%",
                        "decimals": 1
                    }
                },
                {
                    "values":fullBar,
                    "legend-text": "Disabled",
                    "backgroundColor":'#999999',
                    "tooltip":{
                      "text":""
                    }
                }
            ]
            }
    ]
    }
  zingchart.render({ 
    id : chartName, 
    data : myConfig,
    //height: 600, 
    width: "100%"
  });
}

function calculateStatistics(arr) {
  let m = quantile(arr, 0.5);
  let q1 = quantile(arr, 0.25);
  let q3 = quantile(arr, 0.75);
  let statsMin = getMin(arr);
  let statsMax = getMax(arr);

  return [statsMin, q1, m, q3, statsMax];
}

function renderBoxPlot(labels, data, title, chartName) {
  let timeChartConfig = {
    "graphset":[
        {
            "title": {
              "fontColor": chartFontColor,
              "text": title,
              "align": "left",
              "offsetX": 10,
              "fontSize": 20
            },
            "type":"hboxplot",
            "background-color":"white",
            "plotarea":{
                "margin-left":"22%",
                "margin-right":"15%"
            },
            "plot":{
                "dataStationName":labels,
                },
            /*"scale-x":{
                "zooming":true,
                "ranged":true,
                "labels":sites,
                //"format":"%v",
                "tick":{
                    "-visible":false
                    },
                "visible": false,
                "item":{
                    "font-size":"14px"
                    },
                "guide":{
                    "lineWidth":1,
                    "visible":true
                    },
                //"minValue":0,
                //"maxValue":600
                },*/
            "scale-x": {
                  "offset-start": 40,
                  "offset-end": 40,
                  "line-color": "none",
                  "labels": labels,
                  "tick": {
                    "visible": false
                  },
                  "item": {
                    "font-size": "7px"
                  },
                  "guide": {
                    "visible": false
                  }
            },
            "scale-y":{
                "label":{
                    "text":"Time [ms]"
                    },
                "ref-line":{
                    "visible":true,
                    "line-color":"darkgrey",
                    "line-width":1,
                    "line-style":"solid"
                    },
                "format":"%v",
                "line-color":"darkgrey",
                "tick":{
                    "line-color":"darkgrey"
                    },
                "item":{
                    "font-size":"14px"
                    },
                "guide":{
                    "visible":true
                    }
                },
            "options":{
                "box":{
                    "border-color":"black",
                    "border-width":1,
                    "tooltip":{
                        "align":"right",
                        "paddingBottom":5,
                        "background-color":"darkgrey",
                        "border-color":"lightgrey",
                        "border-radius":0,
                        "text":"%data-station-name"
                        }
                    }
                },
            "series":[
                {
                    "barWidth":25,
                    "data-box":data
                    }
            ]
            }
    ]
  };

  zingchart.render({ 
    id : chartName, 
    data : timeChartConfig,
    //height: 600, 
    width: "100%"
  });
}

function renderDOMInteractiveChart(dbObject) {
  let pages = getSitesArray(dbObject);
  let pagesBySite = getArrayBySite(dbObject);

  let domInteractive = pages.map(element => {
        if (element.hasOwnProperty('navTiming')) {
            if (element.navTiming.hasOwnProperty('domInteractive')) {
                return element.navTiming.domInteractive;
            }
        }
        return null;
    }).filter((e) => typeof(e) === "number");

  let statsDomInteractive = calculateStatistics(domInteractive);

  let stats = [statsDomInteractive];
  let sites = ["Total"];
  Object.keys(pagesBySite).forEach((key) => {
    sites.push(key);
    let timeData = pagesBySite[key].map(element => {
        if (element.hasOwnProperty('navTiming')) {
            if (element.navTiming.hasOwnProperty('domInteractive')) {
                return element.navTiming.domInteractive;
            }
        }
        return null;
    }).filter((e) => typeof(e) === "number");
    
    let statsData = calculateStatistics(timeData);
    stats.push(statsData);
  });

  renderBoxPlot(sites, stats, "DOM Interactive", "time-box-chart");
}

function renderTotalTimeChart(dbObject) {
  let pages = getSitesArray(dbObject);
  let pagesBySite = getArrayBySite(dbObject);

  let totalTime = pages.filter(element => {
      if (element.hasOwnProperty('navTiming')) {
          if (element.navTiming.hasOwnProperty('responseEnd') && element.navTiming.hasOwnProperty('requestStart')) {
                return element.navTiming.responseEnd !== 0 && element.navTiming.requestStart !== 0 && typeof(element.navTiming.responseEnd) === "number" && typeof(element.navTiming.requestStart) === "number"
           }
       }
       return false;
  }).map(element => element.navTiming.responseEnd - element.navTiming.requestStart)
    .filter((e) => typeof(e) === "number");

  let statsTotalTime = calculateStatistics(totalTime);

  let stats = [statsTotalTime];
  let sites = ["Total"];
  Object.keys(pagesBySite).forEach((key) => {
    sites.push(key);
    let timeData = pagesBySite[key].filter(element => {
      if (element.hasOwnProperty('navTiming')) {
          if (element.navTiming.hasOwnProperty('responseEnd') && element.navTiming.hasOwnProperty('requestStart')) {
                return element.navTiming.responseEnd !== 0 && element.navTiming.requestStart !== 0 && typeof(element.navTiming.responseEnd) === "number" && typeof(element.navTiming.requestStart) === "number"
           }
       }
       return false;
  }).map(element => element.navTiming.responseEnd - element.navTiming.requestStart)
    .filter((e) => typeof(e) === "number");
    
    let statsData = calculateStatistics(timeData);
    stats.push(statsData);
  });

  renderBoxPlot(sites, stats, "Total Loading Time", "total-time-box-chart");
}

function renderResourceTimingChart(dbObject) {
  const getFileEnding = str => {
    if (typeof(str) === "string") {
      return str.split('.').pop();
    } else {
      return "";
    }
  };

  let pages = getSitesArray(dbObject);
  let resourceTiming = pages.map(element => {
      if (element.hasOwnProperty('resourceTiming')) {
          return element.resourceTiming;
      }
      return null;
  }).filter(element => element !== null);

  let timings = [];

  resourceTiming.forEach(element => {
    element.forEach(e => {
      timings.push(e);
    });
  });

  let totalTimes = timings.map(element => element.responseEnd - element.responseStart);

  let names = timings.map(element => element.name);
  let fileEndings = names.map(element => getFileEnding(element));

  let types = {
    "png": "Image",
    "jpg": "Image",
    "gif": "Image",
    "ico": "Image",
    "webp": "Video",
    "css": "CSS",
    "html": "HTML",
    "js": "JavaScript"
  };

  let data = {};

  for (let i = 0; i < fileEndings.length; i++) {
    let type = "Other";
    if (types.hasOwnProperty(fileEndings[i])) {
      type = types[fileEndings[i]];
    }
    if (!data.hasOwnProperty(type)) {
      data[type] = 0;
    }
    data[type] += totalTimes[i];
  };

  renderPieChart(data, "resource-timing-chart", "Loading Time by Resource Type");
}


/// HELPER FUNCTIONS

const getMax = (numbers) => numbers.reduce((x,y) => x >= y ? x : y, 0);
const getMin = (numbers) => numbers.reduce((x,y) => x <= y ? x : y, 0);

/* inspired by: https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php */
const quantile = (arr, q) => {
    arr.sort((a,b) => a-b);
    const sorted = arr;
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};
