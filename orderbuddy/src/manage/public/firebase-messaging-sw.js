
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');


// testing
// firebase.initializeApp({
//   apiKey: "AIzaSyDBVx5SSG00FnQdPObemy1lqvwlYEU_cK4",
//   authDomain: "test-manage-app.firebaseapp.com",
//   projectId: "test-manage-app",
//   storageBucket: "test-manage-app.firebasestorage.app",
//   messagingSenderId: "981875567127",
//   appId: "1:981875567127:web:5a3e53e90c95de8da8ca52",
//   measurementId: "G-2NP1QM5GLS"
// });


//real
firebase.initializeApp({
   
  apiKey: "AIzaSyAZ66UkWykI_qEvv-Gw5o0JfB_4jR15Cdg",
 
  authDomain: "order-buddy-f2fe2.firebaseapp.com",
 
  projectId: "order-buddy-f2fe2",
 
  storageBucket: "order-buddy-f2fe2.firebasestorage.app",
 
  messagingSenderId: "541162236361",
 
  appId: "1:541162236361:web:d065878f2f8f108484a018",
 
  measurementId: "G-J5QHTRTFG5"


});
// firebase.initializeApp({
//   apiKey: '__FIREBASE_API_KEY__',
//   authDomain: '__FIREBASE_AUTH_DOMAIN__',
//   projectId: '__FIREBASE_PROJECT_ID__',
//   storageBucket: '__FIREBASE_STORAGE_BUCKET__',
//   messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
//   appId: '__FIREBASE_APP_ID__',
//   measurementId: '__FIREBASE_MEASUREMENT_ID__',
// });



const messaging = firebase.messaging();



messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title || 'New Message';
  const notificationOptions = {
    body: payload.notification.body || 'New notification received',
    icon: '/assets/icon/orderbuddy-192.png',
    badge: '/assets/icon/orderbuddy-192.png',
    data: payload.data,
    tag: 'notification-1',
    actions: [
      {
        action: 'view',
        title: 'View'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});


messaging.onMessage((payload) => console.log('Message received. ', payload));