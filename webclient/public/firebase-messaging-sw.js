importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAC4cEsmqRUTSNF1VBAiQdsNNNcs4HeWqo',
  authDomain: 'infrequent-scheduler.firebaseapp.com',
  projectId: 'infrequent-scheduler',
  storageBucket: 'infrequent-scheduler.appspot.com',
  messagingSenderId: '9005250937',
  appId: '1:9005250937:web:2133237a6e4d0e7d7e57a8',
  measurementId: 'G-DFSJ99XM8Z',
};

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
/*messaging.onMessage((payload) => {
  console.log('hello!');
  // ...
});*/
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received foreground message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
