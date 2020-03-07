firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    checkIfAdmin(user);
  }
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
      if (json.type === 'admin') {
        let dropdownEl = document.getElementById('profileOptions');
        let userOptions = document.createElement('a');
        userOptions.innerHTML = `Users`;
        userOptions.setAttribute('href', './users.html');
        userOptions.classList.add('navbar-item');
        dropdownEl.appendChild(userOptions);
      }
    })
    .catch(err => {
      console.log(err);
    });
}
