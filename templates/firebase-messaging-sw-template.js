importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');


firebase.initializeApp({
    // EDITME:
    apiKey: 'AIzaSyClJABJ53vLdeftattdyVCDrkMMnJyp3LU',
    authDomain: 'tawridco-86b74.firebaseapp.com',
    projectId: 'tawridco-86b74',
    storageBucket: '917028456112',
    messagingSenderId: 'tawridco-86b74.firebasestorage.app',
    appId: '1:917028456112:web:05b5105eab8d8ea9b21d75',
    measurementId: 'G-ZFJJGLKP4Z',
});

const messaging = firebase.messaging();

try {
    messaging.setBackgroundMessageHandler(function (payload) {
        let data = payload?.notification;
        const notificationTitle = data?.title;
        const notificationOptions = {
            body: data?.body,
            icon: './logo.png' || 0,
            image: data?.image
        };

        return self.registration.showNotification(notificationTitle,
            notificationOptions);
    });

} catch (error) {
    console.log("This is an error ->", error);
}
