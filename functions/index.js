const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccount.json')),
  databaseURL: 'https://cse135finalproject.firebaseio.com'
});
const firebaseConfig = {
  apiKey: 'AIzaSyClOiJERHHSH8yQYrOM8r8CUkvSWgImNuA',
  authDomain: 'cse135finalproject.firebaseapp.com',
  projectId: 'cse135finalproject',
  databaseURL: 'https://cse135finalproject.firebaseio.com'
};
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();
const joi = require('@hapi/joi');
const sanitizer = require('sanitize-html');
const cookie = require('cookie');
const url = require('url');
const queryString = require('querystring');

const dbCollection = '/reports/';

const purgeSchema = joi.object({
  url: joi.string().required(),
  user: joi.string().required()
});

const collectSchema = joi.object({
  url: joi.string().required(),
  report: joi
    .object({
      mouseClickEvents: joi
        .array()
        .required()
        .optional(),
      mouseMoveEvents: joi
        .array()
        .required()
        .optional(),
      keyEvents: joi
        .array()
        .required()
        .optional(),
      scrollEvents: joi
        .array()
        .required()
        .optional(),
      beforeunload: joi
        .object()
        .required()
        .unknown(),
      language: joi.string().required(),
      userAgent: joi.string().required(),
      maxScreenHeight: joi.number().required(),
      maxScreenWidth: joi.number().required(),
      currScreenHeight: joi.number().required(),
      currScreenWidth: joi.number().required(),
      effectiveConnectionType: joi.string().allow(''),
      cookieEnabled: joi.boolean().required(),
      imagesEnabled: joi.boolean().required(),
      cssEnabled: joi.boolean().required(),
      JSEnabled: joi.boolean().required(),
      resourceTiming: joi
        .array()
        .required()
        .optional(),
      navTiming: joi
        .object()
        .required()
        .unknown(),
      totalTime: joi.number().required(),
      idleCount: joi.number().required()
    })
    .unknown()
    .required()
});

exports.updateUser = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private'); // required for cookie according to documentation
  let body = JSON.parse(req.body);
  const uid = body.uid;
  const email = body.email;
  const type = body.type;
  admin
    .auth()
    .updateUser(uid, { email })
    .then(() => {
      if (type === 'admin') {
        changeAdminPrivilages(uid, true);
      } else {
        changeAdminPrivilages(uid, false);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).end();
    });
});

exports.deleteUser = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private'); // required for cookie according to documentation
  const uid = JSON.parse(req.body).uid;
  admin
    .auth()
    .deleteUser(uid)
    .then(() => {
      console.log('success');
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.status(500).end();
    });
});

function changeAdminPrivilages(uid, adminBool) {
  admin
    .auth()
    .setCustomUserClaims(uid, { admin: adminBool })
    .catch(error => {
      console.log(error);
    });
}

exports.registerAdminUser = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private'); // required for cookie according to documentation
  const uid = JSON.parse(req.body).uid;
  admin
    .auth()
    .setCustomUserClaims(uid, { admin: true })
    .then(() => {
      res.end();
    })
    .catch(error => {
      console.log(error);
      res.status(500).json(error);
    });
});

exports.checkUserType = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private'); // required for cookie according to documentation
  const uid = JSON.parse(req.body).uid;

  // Verify the ID token first.
  admin
    .auth()
    .getUser(uid)
    .then(user => {
      if (user.customClaims && user.customClaims.admin === true) {
        res.json({ type: 'admin' });
      } else {
        res.json({ type: 'regular' });
      }
    });
});

exports.createUser = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private'); // required for cookie according to documentation
  let body = JSON.parse(req.body);
  const email = body.email;
  const pass = body.pass;
  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,
      password: pass,
      disabled: false
    })
    .then(() => {
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.status(500).end();
    });
});

exports.getUsers = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private'); // required for cookie according to documentation
  const uid = JSON.parse(req.body).uid;

  // Verify the ID token first.
  admin
    .auth()
    .getUser(uid)
    .then(user => {
      if (user.customClaims && user.customClaims.admin === true) {
        admin
          .auth()
          .listUsers(1000)
          .then(users => {
            res.json(users);
          })
          .catch(error => {
            console.log(error);
            res.status(500).json(error);
          });
      } else {
        res.status(401).end();
      }
    });
});

exports.tracker = functions.https.onRequest((req, res) => {
  // Set headers for response
  res.set('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private'); // required for cookie according to documentation

  // Get cookie
  let stateCookie = null;
  try {
    stateCookie = cookie.parse(req.headers.cookie).__session;
  } catch (err) {}

  let rawUrl = req.url;
  let parsedUrl = url.parse(rawUrl);
  let parsedQs = queryString.parse(parsedUrl.query);

  let noscriptKey = null;
  if (
    'noscript' in parsedQs &&
    'url' in parsedQs &&
    parsedQs['noscript'] === 'true'
  ) {
    let today = new Date(Date.now());
    let date =
      today.toLocaleDateString() +
      ' ' +
      today.getHours() +
      ':' +
      today.getMinutes();
    noscriptKey = parsedQs['url'] + ' ' + date + ' (noscript)';
  }

  let addNoScriptKey = (user, key) => {
    if (key !== null) {
      db.collection(dbCollection)
        .doc(user)
        .set({ [key]: '' }, { merge: true })
        .then(() => {
          console.log('Added key ' + key + ' to database as noscript option');
        })
        .catch(error => {
          console.log('[Tracker] ' + error);
        });
    }
  };

  let createID = () => {
    db.collection(dbCollection)
      .add({}) // add empty document to create new ID
      .then(doc => {
        console.log('[Tracker] New ID issued: ' + doc.id);
        res.cookie('__session', doc.id, { maxAge: 14 * 24 * 3600 * 1000 }); // 14 days lifetime
        res.json({ token: doc.id });
        addNoScriptKey(doc.id, noscriptKey);
      })
      .catch(error => {
        console.log('[Tracker] Error could not issue ID');
        res.status(500).json(error);
      });
  };

  let returnID = stateCookie => {
    console.log('[Tracker] Return same valid ID ' + stateCookie);
    res.cookie('__session', stateCookie, { maxAge: 14 * 24 * 3600 * 1000 }); // refresh cookie for 14 days
    res.json({ token: stateCookie });
    addNoScriptKey(stateCookie, noscriptKey);
  };

  // Check whether the ID from cookie exists and is valid
  if (stateCookie !== null) {
    db.collection(dbCollection)
      .doc(stateCookie)
      .get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          // If cookie has valid ID then return same id
          returnID(stateCookie);
        } else {
          // ID not valid -> create new ID
          createID();
        }
      })
      .catch(error => {
        console.log('[Tracker] Error checking if ID exists');
        res.status(500).json(error);
      });
  } else {
    createID();
  }
});

exports.collect = functions.https.onRequest((req, res) => {
  let cleanBody = sanitizer(req.body);
  let requestBody = JSON.parse(cleanBody);

  // validate
  const { error, value } = collectSchema.validate(requestBody);
  if (error) {
    console.log(error);
    res.status(403).end();
    return;
  }

  // get the session
  let id = null;
  try {
    id = cookie.parse(req.headers.cookie).__session;
  } catch (error) {}
  let url = requestBody.url;
  let report = requestBody.report;

  // Check if ID is null
  if (id === null) {
    console.log('[Collect] Collect endpoint called without session cookie');
    res.status(500).json({
      error:
        'Cookie __session has invalid ID, call tracker endpoint to set new cookie'
    });
    res.end();
    return;
  }

  let storeCollection = doc_id => {
    // store in db
    db.collection(dbCollection)
      .doc(doc_id)
      .set({ [url]: report }, { merge: true })
      .then(doc => {
        console.log('[Collect] Stored analytics data successfully');
        res.json({ token: doc.id });
      })
      .catch(error => {
        console.log('[Collect] Could not store analytics data in firestore');
        res.status(500).json(error);
      });
  };

  // Check if ID is in database
  db.collection(dbCollection)
    .doc(id)
    .get()
    .then(docSnapshot => {
      if (docSnapshot.exists) {
        storeCollection(id);
      } else {
        console.log('[Collect] Cookie has invalid session ID');
        res.status(500).json({
          error:
            'Cookie __session has invalid ID, call tracker endpoint to set new cookie'
        });
      }
    })
    .catch(error => {
      console.log('[Collect] Error checking if ID is in database');
      res.status(500).json(error);
    });
});

exports.query = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  db.collection(dbCollection)
    .get()
    .then(result => {
      let reportsJson = {};

      result.forEach(doc => {
        reportsJson[doc.id] = doc.data();
      });
      res.json(reportsJson);
    });
});

exports.purgeAll = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  db.collection(dbCollection)
    .get()
    .then(docs => {
      docs.forEach(doc => {
        doc.ref.delete();
      });
      res.end();
    })
    .catch(error => {
      res.json(error);
    });
});

exports.purge = functions.https.onRequest((req, res) => {
  let requestBody = sanitizer(req.body);
  requestBody = JSON.parse(requestBody);

  let key = requestBody.url;
  let user = requestBody.user;

  const { error, value } = purgeSchema.validate(requestBody);
  if (error) {
    console.log('[Purge] ' + error);
    res.status(403).end();
    return;
  }

  console.log(req.body);
  console.log('key ' + key);
  console.log('user ' + user);

  let docRef = db.collection(dbCollection).doc(user);
  docRef
    .get()
    .then(doc => {
      if (!doc.exists) {
        console.log(
          '[Purge] Invalid user id given (document of user does not exist in firestore)'
        );
        res.status(403).end();
        return;
      }
      let data = doc.data();
      delete data[key];
      db.collection(dbCollection)
        .doc(user)
        .set(data);
      res.status(200).json({ ok: 'ok' });
    })
    .catch(error => {
      res.status(500).json({ error: error });
      console.log(error);
    });
});
