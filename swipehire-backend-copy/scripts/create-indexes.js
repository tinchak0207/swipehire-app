#!/usr/bin/env node

/**
 * Create optimized database indexes for maximum performance
 * Run with: node scripts/create-indexes.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';

async function createIndexes() {
  console.log('🚀 Creating optimized database indexes...');
  
  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const db = client.db('swipehire');

    console.log('📊 Connected to MongoDB');

    // Users collection indexes
    console.log('📝 Creating user indexes...');
    await db.collection('users').createIndexes([
      { key: { firebaseUid: 1 }, unique: true, name: 'firebase_uid_unique' },
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { selectedRole: 1, createdAt: -1 }, name: 'role_created' },
      { key: { 'profileSkills': 1 }, name: 'skills_index' },
      { key: { country: 1, selectedRole: 1 }, name: 'country_role' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { updatedAt: -1 }, name: 'updated_desc' },
      { 
        key: { profileLocationPreference: 1, selectedRole: 1 }, 
        name: 'location_role' 
      },
      {
        key: { profileSalaryExpectationMin: 1, profileSalaryExpectationMax: 1 },
        name: 'salary_range'
      }
    ]);

    // Jobs collection indexes
    console.log('💼 Creating job indexes...');
    await db.collection('jobs').createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: 'user_created' },
      { key: { isPublic: 1, createdAt: -1 }, name: 'public_created' },
      { key: { location: 1, isPublic: 1 }, name: 'location_public' },
      { key: { jobType: 1, isPublic: 1 }, name: 'jobtype_public' },
      { key: { workStyle: 1, isPublic: 1 }, name: 'workstyle_public' },
      { key: { companyIndustry: 1, isPublic: 1 }, name: 'industry_public' },
      { key: { salary: 1, isPublic: 1 }, name: 'salary_public' },
      { key: { createdAt: -1 }, name: 'job_created_desc' },
      {
        key: { title: 'text', description: 'text', companyName: 'text' },
        name: 'text_search'
      }
    ]);

    // Matches collection indexes
    console.log('🎯 Creating match indexes...');
    await db.collection('matches').createIndexes([
      { key: { userId1: 1, createdAt: -1 }, name: 'user1_created' },
      { key: { userId2: 1, createdAt: -1 }, name: 'user2_created' },
      { key: { userId1: 1, userId2: 1 }, unique: true, name: 'user_pair_unique' },
      { key: { status: 1, createdAt: -1 }, name: 'status_created' },
      { key: { isArchived: 1, createdAt: -1 }, name: 'archived_created' }
    ]);

    // Notifications collection indexes
    console.log('🔔 Creating notification indexes...');
    await db.collection('notifications').createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: 'user_created' },
      { key: { userId: 1, isRead: 1, createdAt: -1 }, name: 'user_read_created' },
      { key: { userId: 1, type: 1, createdAt: -1 }, name: 'user_type_created' },
      { key: { createdAt: -1 }, name: 'notification_created' }
    ]);

    // Reviews collection indexes
    console.log('⭐ Creating review indexes...');
    await db.collection('companyreviews').createIndexes([
      { key: { companyUserId: 1, createdAt: -1 }, name: 'company_created' },
      { key: { companyUserId: 1, rating: 1 }, name: 'company_rating' },
      { key: { reviewerId: 1, companyUserId: 1 }, unique: true, name: 'reviewer_company_unique' },
      { key: { createdAt: -1 }, name: 'review_created' }
    ]);

    // Chat messages collection indexes
    console.log('💬 Creating chat indexes...');
    await db.collection('chatmessages').createIndexes([
      { key: { matchId: 1, createdAt: 1 }, name: 'match_created' },
      { key: { senderId: 1, createdAt: -1 }, name: 'sender_created' },
      { key: { createdAt: -1 }, name: 'chat_created' }
    ]);

    // Diary posts collection indexes
    console.log('📖 Creating diary indexes...');
    await db.collection('diaryposts').createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: 'diary_user_created' },
      { key: { createdAt: -1 }, name: 'diary_created' }
    ]);

    // Follow-up reminders collection indexes
    console.log('⏰ Creating reminder indexes...');
    await db.collection('followupreminders').createIndexes([
      { key: { userId: 1, scheduledAt: 1 }, name: 'user_scheduled' },
      { key: { userId: 1, status: 1, scheduledAt: 1 }, name: 'user_status_scheduled' },
      { key: { scheduledAt: 1, status: 1 }, name: 'scheduled_status' },
      { key: { createdAt: -1 }, name: 'reminder_created' }
    ]);

    // Industry events collection indexes
    console.log('🎪 Creating event indexes...');
    await db.collection('industryevents').createIndexes([
      { key: { startDate: 1, endDate: 1 }, name: 'date_range' },
      { key: { industry: 1, startDate: 1 }, name: 'industry_date' },
      { key: { location: 1, startDate: 1 }, name: 'location_date' },
      { key: { isPublic: 1, startDate: 1 }, name: 'public_date' },
      { key: { createdAt: -1 }, name: 'event_created' }
    ]);

    // User event interactions collection indexes
    console.log('👥 Creating interaction indexes...');
    await db.collection('usereventinteractions').createIndexes([
      { key: { userId: 1, eventId: 1 }, unique: true, name: 'user_event_unique' },
      { key: { userId: 1, interactionType: 1, createdAt: -1 }, name: 'user_type_created' },
      { key: { eventId: 1, interactionType: 1, createdAt: -1 }, name: 'event_type_created' }
    ]);

    console.log('✅ All indexes created successfully!');
    console.log('🚀 Database is now optimized for ultra-fast queries!');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await client.close();
  }
}

// Run the index creation
if (import.meta.url === `file://${process.argv[1]}`) {
  createIndexes().catch(console.error);
}

export default createIndexes;