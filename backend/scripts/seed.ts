import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/insightflow';

import Event from '../src/models/Event';

// Realistic funnel progression
const FUNNEL = ['/home', '/products', '/cart', '/checkout'];
const NUM_SESSIONS = 25;

// Helper to generate a random delay between events
const randomDelay = (min = 2000, max = 15000) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedData() {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    console.log('Clearing existing data...');
    await Event.deleteMany({});

    console.log(`Generating ${NUM_SESSIONS} realistic sessions...`);

    const events = [];
    let pageViewsCount = 0;
    let clicksCount = 0;

    for (let i = 0; i < NUM_SESSIONS; i++) {
      const sessionId = `session-v3-${i}-${Date.now()}`;
      
      const daysAgo = Math.floor(Math.random() * 7);
      let currentTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).getTime();

      // Determine how far down the funnel this session gets
      // We want conversion rates roughly: Home(100%) -> Products(80%) -> Cart(40%) -> Checkout(20%)
      let maxStep = 0;
      const rand = Math.random();
      if (rand < 0.2) maxStep = 3; // Made it to Checkout (20%)
      else if (rand < 0.4) maxStep = 2; // Made it to Cart (20% -> 40% total)
      else if (rand < 0.8) maxStep = 1; // Made it to Products (40% -> 80% total)
      else maxStep = 0; // Bounced at Home (20% -> 100% total)

      for (let step = 0; step <= maxStep; step++) {
        const currentPage = FUNNEL[step];

        // Page view event
        events.push({
          sessionId,
          eventType: 'page_view',
          pageUrl: currentPage,
          timestamp: new Date(currentTime),
        });
        pageViewsCount++;
        currentTime += randomDelay();

        // Generate 5-15 clicks on this page to build up 1000+ total events
        const clicksThisPage = Math.floor(Math.random() * 10) + 5;
        for (let c = 0; c < clicksThisPage; c++) {
          events.push({
            sessionId,
            eventType: 'click',
            pageUrl: currentPage,
            timestamp: new Date(currentTime),
            coordinates: {
              x: Math.floor(Math.random() * 1920),
              y: Math.floor(Math.random() * 1080),
            },
          });
          clicksCount++;
          currentTime += randomDelay(500, 3000);
        }

        currentTime += randomDelay(1000, 5000); // Delay before next page
      }
    }

    // Add a few random bounces to non-funnel pages to add noise
    for (let i = 0; i < 5; i++) {
      const sessionId = `session-noise-${i}-${Date.now()}`;
      let currentTime = Date.now() - Math.random() * 100000;
      events.push({ sessionId, eventType: 'page_view', pageUrl: '/contact', timestamp: new Date(currentTime) });
      pageViewsCount++;
      for(let c=0; c<5; c++) {
        events.push({ sessionId, eventType: 'click', pageUrl: '/contact', timestamp: new Date(currentTime + c*1000), coordinates: { x: 500, y: 500 } });
        clicksCount++;
      }
    }

    console.log(`Inserting ${events.length} events...`);
    await Event.insertMany(events);

    console.log('✅ V3.0 Seed completed successfully!');
    console.log(`Generated: ${NUM_SESSIONS + 5} Sessions, ${pageViewsCount} Page Views, ${clicksCount} Clicks.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
