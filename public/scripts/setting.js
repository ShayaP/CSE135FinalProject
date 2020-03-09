firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    renderSettingPage(user);
  }
});

function renderSettingPage(user) {
  let emailEl = document.getElementById('email');
  let lastSignInEl = document.getElementById('lastSignIn');
  let creationEl = document.getElementById('creation');
  emailEl.innerHTML = user.email;
  lastSignInEl.innerHTML += user.metadata.creationTime;
  creationEl.innerHTML += user.metadata.lastSignInTime;
}
