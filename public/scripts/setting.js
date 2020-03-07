firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '/login.html';
  } else {
    renderSettingPage(user);
  }
});

function renderSettingPage(user) {
  let emailEl = document.getElementById('email');
  emailEl.innerHTML = user.email;
}
