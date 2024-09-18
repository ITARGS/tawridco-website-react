importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');


firebase.initializeApp({
    // EDITME:
    apiKey: 'AIzaSyBT3LL_VaQavGOX8hV8kRSLpWrkbBKX8io',
    authDomain: 'egrocer-457a9.firebaseapp.com',
    projectId: 'egrocer-457a9',
    storageBucket: '755773183987',
    messagingSenderId: 'egrocer-457a9.appspot.com',
    appId: '1:755773183987:web:79da7c0c3f815e4793e486',
    measurementId: 'G-CZXY4LTFRH',
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
