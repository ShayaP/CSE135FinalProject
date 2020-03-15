document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems, {coverTrigger: false, constrainWidth: false});
});

document.addEventListener("DOMContentLoaded", refreshData2);

var dbObject;

function refreshData2() {
    fetch('/query')
        .then(response => {
            return response.json();
        })
        .then(json => {
            renderSpeedGrid(json);
        });
}

function renderSpeedGrid(json) {
    dbObject = json;
    createSpeedGrid(dbObject);
}

function createSpeedGrid(db) {

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
            let timing = data.navTiming;
            dataDict["User"] = element;
            dataDict["url"] = url;
            dataDict["Total Time"]= data.totalTime.toFixed(4);
            dataDict["Request Start"] = timing.requestStart.toFixed(4);
            dataDict["Response Start"] = timing.responseStart.toFixed(4);
            dataDict["Response End"] = timing.responseEnd.toFixed(4);
            dataDict["DNS Lookup"] = (timing.domainLookupEnd - timing.domainLookupStart).toFixed(4);
            dataDict["DOM Loaded Total"] = (timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart).toFixed(4);
            //dataDict["DOM Interactive"] = timing.domInteractive.toFixed(4);
            dataDict["Load Total"] = (timing.loadEventEnd - timing.loadEventStart).toFixed(
                4
            );
            dataDict["Unload Total"] = (timing.unloadEventEnd - timing.unloadEventStart).toFixed(
                4
            );
             //dataDict["Transfer Size"] = timing.transferSize.toFixed(4);
            list.push(dataDict);
        }

    });
    console.log(list);
    console.log("sepehr speed");
    let gridConfig = GridConfig(list);
    let gridRef1 = new ZingGrid(gridConfig);
    document.querySelector('#speedGrid').appendChild(gridRef1);
}