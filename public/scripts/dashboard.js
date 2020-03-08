document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems, {coverTrigger: false, constrainWidth: false});
  });

document.addEventListener("DOMContentLoaded", refreshData);

var dbObject;

function refreshData() {
  fetch('/query')
    .then(response => {
      return response.json();
    })
    .then(json => {
      render(json);
    });


var chartData = {
  // Specify your chart type
  "type": "bar",
  // Add your series data
  "series": [
    { "values": [35, 42, 67, 89] },
    { "values": [28, 40, 39, 36] }
  ]
};
// Render your chart [3]
zingchart.render({
  id:'firstchart',
  data:chartData,
  height:400,
  width:600
});
}

function render(json) {
  dbObject = json;
  getBrowserData(dbObject);
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
  
  let agents = [];

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

  renderBrowserChart(browserCount);
}

function renderBrowserChart(browserCount) {
  let colors = ['#50ADF5','#FF7965','#FFCB45','#6877e5','#6FB07F'];
  let colorIndex = 0;

  let series = [];

  Object.keys(browserCount).forEach((key) => {
    series.push({
      values : [browserCount[key]],
      text: key,
      backgroundColor: colors[(colorIndex++)%colors.length]
    });
  })

  let browserChartConfig = {
    type: "pie", 
    plot: {
      borderColor: "#2B313B",
      borderWidth: 5,
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
      fontColor: "#8e99a9",
      text: 'Page Loads by Browser',
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
   id : 'browser-chart', 
   data : browserChartConfig, 
   height: 400, 
   width: 600 
 });
}
