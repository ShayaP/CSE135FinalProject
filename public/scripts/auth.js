firebase.initializeApp({
  apiKey: 'AIzaSyClOiJERHHSH8yQYrOM8r8CUkvSWgImNuA',
  authDomain: 'cse135finalproject.firebaseapp.com',
  projectId: 'cse135finalproject'
});

document.addEventListener('DOMContentLoaded', function() {
  modals = document.querySelectorAll('.modal');
  M.Modal.init(modals, {});
});

function login(form) {
  var formData = new FormData(form);
  var data = Object.fromEntries(formData);

  /* For setting a session cookie read: https://firebase.google.com/docs/auth/admin/manage-cookies */

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

  firebase
    .auth()
    .signInWithEmailAndPassword(data.email, data.password);
    // refer to: https://stackoverflow.com/questions/49722324/firebase-getidtoken-not-working
    // -> hence moved the getIdToken() part to onAuthStateChanged
}

function signOut() {
  console.log('called signout');
  
  /*firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = '/login.html';
    });*/
}

function deleteUser(e, callback) {
  let shouldDelete = confirm('Are you sure you want to delete this user?');
  if (shouldDelete) {
    fetch('/deleteUser', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ uid: e.dataset.uid })
    })
      .then(() => {
        callback();
      })
      .catch(err => {
        console.log(err);
      });
  }
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

firebase.auth().onAuthStateChanged(user => {
  if (user && window.location.pathname === '/login.html') {
    user.getIdToken().then(idToken => {
      console.log("Fetch SessionLogin");
      return fetch('/sessionLogin', {method: 'POST', body: JSON.stringify({token: idToken}), credentials: "same-origin"})
        .then(() => {
          window.location.href = '/dashboard.html';
        });
    });
  }
});

function resetPassword(form) {
  var formData = new FormData(form);
  var data = Object.fromEntries(formData);
  firebase
    .auth()
    .sendPasswordResetEmail(data.email)
    .then(() => {
      let el = document.getElementById('statusMsg');
      el.innerHTML = `Email has been sent to: ${data.email}`;
      el.classList.add('is-success');
      el.classList.remove('is-danger');
      let modal = M.Modal.getInstance(
        document.getElementById('forgotPassModal')
      );
      modal.close();
    })
    .catch(err => {
      console.log(err);
    });
}
