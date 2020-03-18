/*firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    renderSettingPage(user);
  }
});*/

document.addEventListener('DOMContentLoaded', () => {
  fetch('/checkUserType').then((res) => {
    return res.json();
  }).then(json => {
    renderSettingPage(json);
  })
})

function renderSettingPage(json) {
  let emailEl = document.getElementById('email');
  let lastSignInEl = document.getElementById('lastSignIn');
  let creationEl = document.getElementById('creation');
  emailEl.innerHTML = json.email;
  lastSignInEl.innerHTML += json.creationTime;
  creationEl.innerHTML += json.lastSignInTime;
}
