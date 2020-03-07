firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    renderUseresPage(user);
  }
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
