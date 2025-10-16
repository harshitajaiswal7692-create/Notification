

const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Load Firebase Admin SDK
require('dotenv').config(); // 👈 load .env variables
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// const serviceAccount = require("./serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const db = admin.firestore();

// 🔽 Middleware
app.use(express.json());             
app.use(bodyParser.json());        


app.use(express.static('public'));    

// 🔽 Routes
app.post('/api/subscribe', async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).send('Missing userId or fcmToken');
  }

  try {
    await db.collection('users').doc(userId).set({
      fcmToken,
      isSubscribed: false  
    }, { merge: true });

    res.send('User subscribed successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to subscribe.');
  }
});

app.post('/api/unsubscribe', async (req, res) => {
  console.log('Received unsubscribe request body:', req.body);

  const { userId } = req.body;

  if (!userId) {
    console.log("❌ Missing userId");
    return res.status(400).send('Missing userId');
  }

  try {
    await db.collection('users').doc(userId).set({
      isSubscribed: true
    }, { merge: true });

    console.log(`✅ Unsubscribed user: ${userId}`);
    res.send('User unsubscribed.');
  } catch (error) {
    console.error("❌ Firestore error:", error);
    res.status(500).send('Failed to unsubscribe: ' + error.message);
  }
});

const sendNotificationToSubscribedUsers = async (title, body) => {
  const usersSnapshot = await db.collection('users')
    .where('isSubscribed', '==', false)
    .get();

  console.log("📥 Found subscribed users:", usersSnapshot.size);

  const messages = [];

  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    if (userData.fcmToken) {
      messages.push({
        token: userData.fcmToken,
        notification: {
          title: title,
          body: body
        },
        webpush: {
          notification: {
            icon: 'https://cat.10515.net/1.jpg',
            click_action: 'https://notification-3-txmo.onrender.com/' 
          }
        }
      });
    }
  });

  if (messages.length === 0) {
    console.log('❌ No subscribed users found.');
    return;
  }

  for (const message of messages) {
    try {
      console.log("📨 Sending to token:", message.token);  
      const response = await admin.messaging().send(message);
      console.log(`✅ Notification sent successfully. Response ID: ${response}`);
      console.log("📨 FCM response:", response);

    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }
};


app.post('/api/sendNotification', async (req, res) => {
  const { title, body } = req.body;
  console.log('Received sendNotification request:', req.body);

  if (!title || !body) {
    console.log('Missing title or body in sendNotification request');
    return res.status(400).send('Missing title or body');
  }

  try {
    await sendNotificationToSubscribedUsers(title, body);
    console.log('Notifications sent successfully1.');
    res.send('Notifications sent successfully12.');
  } catch (err) {
    console.error('Failed to send notifications:', err);
    res.status(500).send('Failed to send notifications.');
  }
});



// 🔽 Start server
app.listen(port, () => {
  console.log(`✅ Server running: http://localhost:${port}`);
});
