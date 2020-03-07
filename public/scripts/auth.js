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

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('singin success.', user);
    window.location.href = '/dashboard.html';
  } else {
    console.log('signin failed');
  }
});
