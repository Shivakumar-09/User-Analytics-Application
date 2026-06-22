const mongoose = require('mongoose');

const uri = 'mongodb+srv://shivakumar_user:Shivakumar@cluster0.omufgsn.mongodb.net/insightflow?appName=Cluster0';

async function verify() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
    process.exit(1);
  }
}

verify();
