const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // <-- path to your file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Static topic and message
const topic = 'news-updates';

const message = {
  topic: topic,
  notification: {
    title: '🔥 Breaking News!',
    body: 'This is a static test notification sent to all topic subscribers.',
    image: 'https://your-site.com/news.jpg' // optional
  },
  webpush: {
    fcmOptions: {
      link: 'http://localhost:3000/news' // opens when notification is clicked (Web)
    }
  }
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log('✅ Successfully sent message:', response);
  })
  .catch((error) => {
    console.error('❌ Error sending message:', error);
  });
