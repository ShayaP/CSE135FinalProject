function login(form) {
  var formData = new FormData(form);
  var data = Object.fromEntries(formData);
  firebase
    .auth()
    .signInWithEmailAndPassword(data.email, data.password)
    .then(function(result) {
      console.log(result);
      // window.location.href = '/dashboard.html';
    })
    .catch(function(error) {
      let el = document.getElementById('statusMsg');
      el.innerHTML = error.message;
      el.classList.add('is-danger');
    });
}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = '/login.html';
    });
}

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    if (window.location.pathname !== '/login.html') {
      window.location.href = '/login.html';
    }
  } else {
    if (window.location.pathname === '/login.html') {
      window.location.href = '/dashboard.html';
    }
  }
});
