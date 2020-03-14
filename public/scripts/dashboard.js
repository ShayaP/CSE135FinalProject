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
  //createBrowserGrid(dbObject);

  renderDOMInteractiveChart(dbObject);
  renderTotalTimeChart(dbObject);
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
   height: 400, 
   width: 600 
 });
}

function renderBrowserChart(dbObject) {
  //console.log(dbObject);
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

  //console.log(css);
  //console.log(totalClicks);

  let data = [css, images, cookies, javascript];
  let labels = ["CSS", "Images", "Cookies", "JS"];
  return [data, labels];
}

function renderFeatureChart(dbObject) {
  let [data, labels] = getFeaturesData(dbObject);
  renderBarChart(data, 'feature-chart', labels, 'Enabled Features');
}

function renderBarChart(data, chartName, labels, title) {
  fullBar = [];
  for (i = 0; i < data.length; i++) {
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


function createBrowserGrid(db) {

    const GridConfig = (data) => {
        return {
            editor: true,
            pager: true,
            pageSize:30,
            layout: 'column',
            layoutControls: true,
            pager: 'top',
            columns: [],
            theme: 'android',
            data
        }
    }
    let list = [];
    let reporterInfo = {};
    Object.keys(db).forEach((element) => {
        reporterInfo = db[element];
        for (const url in reporterInfo) {
            let dataDict = {};
            let data = reporterInfo[url];
            dataDict["User"] = element;
            dataDict["url"] = url;
            dataDict["language"]= data.language;
            dataDict["User Agent"] =  data.userAgent;
            dataDict["maxScreenWidth"] = data.maxScreenWidth;
            dataDict["maxScreenHeight"] = data.maxScreenHeight;
            dataDict["currScreenWidth"] = data.currScreenWidth;
            dataDict["currScreenHeight"] = data.currScreenHeight;
            dataDict["effectiveConnectionType"] = data.effectiveConnectionType;
            dataDict["cookieEnabled"] = data.cookieEnabled;
            dataDict["JSEnabled"] = data.JSEnabled;
            dataDict["cssEnabled"] = data.cssEnabled;
            dataDict["imagesEnabled"] = data.imagesEnabled;
            list.push(dataDict);
        }

    });
        let gridConfig = GridConfig(list);
        let gridRef = new ZingGrid(gridConfig);
        document.querySelector('#browserGrid').appendChild(gridRef);
}

function getTimeData(dbObject) {
  
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
                    "font-size": 14
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
                        "paddingBottom":5,
                        "background-color":"darkgrey",
                        "border-color":"lightgrey",
                        "border-radius":10,
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

  let domInteractive = pages.map(element => element.navTiming.domInteractive)
                            .filter((e) => typeof(e) === "number");

  let statsDomInteractive = calculateStatistics(domInteractive);

  let stats = [statsDomInteractive];
  let sites = ["Total"];
  Object.keys(pagesBySite).forEach((key) => {
    sites.push(key);
    let timeData = pagesBySite[key].map(element => element.navTiming.domInteractive)
                                  .filter((e) => typeof(e) === "number");
    
    let statsData = calculateStatistics(timeData);
    stats.push(statsData);
  });

  renderBoxPlot(sites, stats, "DOM Interactive", "time-box-chart");
}

function renderTotalTimeChart(dbObject) {
  let pages = getSitesArray(dbObject);
  let pagesBySite = getArrayBySite(dbObject);

  console.log(pages.filter(element => element.navTiming.responseEnd !== 0 && element.navTiming.requestStart !== 0 && typeof(element.navTiming.responseEnd) === "number" && typeof(element.navTiming.requestStart) === "number"));
  console.log(pages.filter(element => element.navTiming.responseEnd !== 0 && element.navTiming.requestStart !== 0 && typeof(element.navTiming.responseEnd) === "number" && typeof(element.navTiming.requestStart) === "number")
    .map(element => element.navTiming.responseEnd - element.navTiming.requestStart));
  let totalTime = pages.filter(element => element.navTiming.responseEnd !== 0 && element.navTiming.requestStart !== 0 && typeof(element.navTiming.responseEnd) === "number" && typeof(element.navTiming.requestStart) === "number")
                            .map(element => element.navTiming.responseEnd - element.navTiming.requestStart)
                            .filter((e) => typeof(e) === "number");

  let statsTotalTime = calculateStatistics(totalTime);

  let stats = [statsTotalTime];
  let sites = ["Total"];
  Object.keys(pagesBySite).forEach((key) => {
    sites.push(key);
    let timeData = pagesBySite[key].filter(element => element.navTiming.responseEnd !== 0 && element.navTiming.requestStart !== 0 && typeof(element.navTiming.responseEnd) === "number" && typeof(element.navTiming.requestStart) === "number")
                                  .map(element => element.navTiming.responseEnd - element.navTiming.requestStart)
                                  .filter((e) => typeof(e) === "number");
    
    let statsData = calculateStatistics(timeData);
    stats.push(statsData);
  });

  renderBoxPlot(sites, stats, "Total Loading Time", "total-time-box-chart");
}


/// HELPER FUNCTIONS


/* inspired by: https://jonlabelle.com/snippets/view/javascript/calculate-mean-median-mode-and-range-in-javascript */
/**
 * The "median" is the "middle" value in the list of numbers.
 *
 * @param {Array} numbers An array of numbers.
 * @return {Number} The calculated median value from the specified numbers.
 */
function median(numbers) {
  // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
  var median = 0, numsLen = numbers.length;
  numbers.sort();

  if (
      numsLen % 2 === 0 // is even
  ) {
      // average of two middle numbers
      median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
  } else { // is odd
      // middle number only
      median = numbers[(numsLen - 1) / 2];
  }

  return median;
}

const getMax = (numbers) => numbers.reduce((x,y) => x >= y ? x : y);
const getMin = (numbers) => numbers.reduce((x,y) => x <= y ? x : y);

/* inspired by https://jonlabelle.com/snippets/view/javascript/calculate-mean-median-mode-and-range-in-javascript */
// alternative mean/average method (from https://www.30secondsofcode.org/snippet/average):
const mean = (...numbers) => numbers.reduce((acc, val) => acc + val, 0) / numbers.length;

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