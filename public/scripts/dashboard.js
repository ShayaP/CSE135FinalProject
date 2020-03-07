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

function getBrowserData(dbObject) {
  let pages = getSitesArray(dbObject);
  
  let agents = [];

  pages.forEach((page) => {
    agents.push(page.userAgent);
  });

  
}
