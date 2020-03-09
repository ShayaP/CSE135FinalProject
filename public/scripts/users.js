firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    renderUseresPage(user);
  }
});

let selects;
let modals;

document.addEventListener('DOMContentLoaded', function() {
  modals = document.querySelectorAll('.modal');
  M.Modal.init(modals, {});

  selects = document.querySelectorAll('select');
  M.FormSelect.init(selects, {});
});

function renderUseresPage(user = firebase.auth().currentUser) {
  fetch('/getUsers', {
    method: 'POST',
    credentials: 'include',
    body: `{"uid":"${user.uid}"}`
  })
    .then(r => r.json().then(data => ({ status: r.status, body: data })))
    .then(obj => {
      if (obj.status === 200) {
        fillInTable(obj.body.users);
      }
    });
}

function fillInTable(users) {
  let tableBodyEl = document.getElementById('tableBody');
  tableBodyEl.innerHTML = '';
  for (const user of users) {
    let userType = 'regular';
    if (user.customClaims && user.customClaims.admin === true) {
      userType = 'admin';
    }
    tableBodyEl.innerHTML += `
      <tr>
        <th>${user.uid}</th>
        <td>${user.email}</td>
        <td>${user.emailVerified}</td>
        <td>${userType}</td>
        <td>${user.metadata.lastSignInTime}</td>
        <td>${user.metadata.creationTime}</td>
        <td><a href="#editModal" class="waves-effect waves-light btn modal-trigger mt-3 valign" onclick="storeUID(this)" data-uid="${user.uid}"><i class="material-icons">edit</i>Edit</a></td>
        <td><button data-uid="${user.uid}" onclick="deleteUser(this, renderUseresPage)" type="button" class="waves-effect waves-green btn valign"><i class="material-icons">delete</i>Remove</button></td>
      </tr>
    `;
  }
}

function addUser(form) {
  var formData = new FormData(form);
  var data = Object.fromEntries(formData);
  fetch('/createUser', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data)
  })
    .then(() => {
      renderUseresPage();
      let modal = M.Modal.getInstance(document.getElementById('addModal'));
      modal.close();
    })
    .catch(err => {
      console.log(err);
    });
}

function editUser(form) {
  let uid = form.dataset.uid;
  var formData = new FormData(form);
  var data = Object.fromEntries(formData);
  data.uid = uid;

  fetch('/updateUser', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data)
  })
    .then(() => {
      renderUseresPage();
      let modal = M.Modal.getInstance(document.getElementById('editModal'));
      modal.close();
    })
    .catch(err => {
      console.log(err);
    });
}

function storeUID(e) {
  let uid = e.dataset.uid;
  let el = document.getElementById('editUserForm');
  el.dataset.uid = uid;
}
