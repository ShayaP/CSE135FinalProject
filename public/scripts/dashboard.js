document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems, {coverTrigger: false, constrainWidth: false});
  });

document.addEventListener("DOMContentLoaded", refreshData);

var dbObject = {};

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
  let userList = document.getElementById('user-list');
  userList.innerHTML = '';
  for (const user in dbObject) {
    userList.innerHTML += `
        <li>
          <a href="#" class="" onclick="renderUser('${user}')">
            ${user}
          </a>
        </li>`;
  }
  renderUser(null);
}

