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
            createBrowserGrid(json);
        });
}

function renderSpeedGrid(json) {
    dbObject = json;
    createSpeedGrid(dbObject);
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