firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    renderUseresPage(user);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.modal');
  M.Modal.init(elems, {});

  elems = document.querySelectorAll('select');
  M.FormSelect.init(elems, {});
});

function renderUseresPage(user) {
  console.log(user.uid);
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
      <tr onmouseover="addHoverEffect(this)" onmouseout="removeHoverEffect(this)">
        <th>${user.uid}</th>
        <td>${user.email}</td>
        <td>${user.emailVerified}</td>
        <td>${userType}</td>
        <td>${user.metadata.lastSignInTime}</td>
        <td>${user.metadata.creationTime}</td>
        <td><a href="#" class="waves-effect waves-green btn valign"><i class="material-icons">edit</i>Edit</a></td>
        <td><a href="#" class="waves-effect waves-green btn valign"><i class="material-icons">delete</i>Remove</a></td>
      </tr>
    `;
  }
}

function addHoverEffect(e) {
  e.classList.add('is-selected');
}

function removeHoverEffect(e) {
  e.classList.remove('is-selected');
}

function addUser(form) {
  var formData = new FormData(form);
  var data = Object.fromEntries(formData);
  firebase
    .auth()
    .createUserWithEmailAndPassword(data.email, data.password)
    .then(res => {
      if (data.type === 'admin') {
        fetch('/registerAdminUser', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ uid: res.user.uid })
        }).catch(err => {
          console.log('Got error: ', err);
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
}
