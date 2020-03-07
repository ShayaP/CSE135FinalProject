firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    checkIfAdmin(user);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.dropdown-trigger');
  var instances = M.Dropdown.init(elems, {
    coverTrigger: false,
    constrainWidth: false
  });
});

function checkIfAdmin(user) {
  let obj = { uid: user.uid };
  fetch('/checkUserType', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(obj)
  })
    .then(res => {
      return res.json();
    })
    .then(json => {
      let dropdownEl = document.getElementById('dropdown-list');
      if (json.type === 'admin') {
        dropdownEl.innerHTML = `
        <li><a href="#" style="color: #444444;">${user.email}</a></li>
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
          <a onclick="signOut()"
            ><i class="material-icons">exit_to_app</i>Logout</a
          >
        </li>`;
      } else {
        dropdownEl.innerHTML = `
          <li><a href="#" style="color: #444444;">${user.email}</a></li>
          <li>
            <a href="/setting.html"
              ><i class="material-icons">settings</i>Profile Settings</a
            >
          </li>
          <li>
            <a onclick="signOut()"
              ><i class="material-icons">exit_to_app</i>Logout</a
            >
          </li>`;
      }
    })
    .catch(err => {
      console.log(err);
    });
}
