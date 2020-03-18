/*firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/in.html';
  } else {
    checkIfAdmin(user);
  }
});*/

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.dropdown-trigger');
  var instances = M.Dropdown.init(elems, {
    coverTrigger: false,
    constrainWidth: false
  });
  checkIfAdmin();
});

// Check if the user is logged in or not
document.addEventListener("DOMContentLoaded", checkIfLoggedIn);

function checkIfLoggedIn() {
  console.log('calling checkIfLoggedIn')
  fetch('/checkUserType', {method: 'GET'})
  .then(res => {
    if (res.status === 403) {
      window.location.href = '/login.html';
    } else {
      return res.json();
    }
    
  })
  .then( obj => {
    if (obj.type === 'unauthorized') {
      window.location.href = '/login.html';
    }
  })
  .catch(err => {
    console.log(err);
  })
}

function checkIfAdmin() {
  fetch('/checkUserType', {
    credentials: 'include',
  })
    .then(res => {
      if (res.status === 403) {
        window.location.href = '/login.html';
      } else {
        return res.json();
      }
    })
    .then(json => {
      let dropdownEl = document.getElementById('dropdown-list');
      if (json.type === 'admin') {
        dropdownEl.innerHTML = `
        <li><a href="#" style="color: #444444;">${json.email}</a></li>
        <li>
          <a href="/users.html"
            ><i class="material-icons">settings_applications</i>Admin Control
            Center</a
          >
        </li>
        <li>
          <a href="/setting.html"
            ><i class="material-icons">settings</i>Profile Settings</a
          >
        </li>
        <li>
          <a href="/sessionLogout"
            ><i class="material-icons">exit_to_app</i>Logout</a
          >
        </li>`;
      } else {
        dropdownEl.innerHTML = `
          <li><a href="#" style="color: #444444;">${json.email}</a></li>
          <li>
            <a href="/setting.html"
              ><i class="material-icons">settings</i>Profile Settings</a
            >
          </li>
          <li>
            <a href="/sessionLogout"
              ><i class="material-icons">exit_to_app</i>Logout</a
            >
          </li>`;
      }
    })
    .catch(err => {
      console.log(err);
    });
}
