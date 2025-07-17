const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/swipehire';

const indexes = {
  users: [
    {
      key: { selectedRole: 1, profileVisibility: 1, createdAt: -1 },
      name: 'discovery_main',
      background: true
    },
    {
      key: { country: 1, selectedRole: 1, profileVisibility: 1 },
      name: 'location_discovery',
      background: true
    },
    {
      key: { 'profileWorkExperienceLevel': 1, selectedRole: 1 },
      name: 'experience_discovery',
      background: true
    },
    {
      key: { 'profileJobTypePreference': 1, selectedRole: 1 },
      name: 'job_type_discovery',
      background: true
    },
    {
      key: { 'profileSalaryExpectationMin': 1, selectedRole: 1 },
      name: 'salary_discovery',
      background: true
    },
    {
      key: { name: 'text', 'profileHeadline': 'text', 'profileExperienceSummary': 'text', 'profileSkills': 'text' },
      name: 'user_text_search',
      background: true
    }
  ],
  matches: [
    {
      key: { userA_Id: 1, status: 1, createdAt: -1 },
      name: 'userA_status_created',
      background: true
    },
    {
      key: { userB_Id: 1, status: 1, createdAt: -1 },
      name: 'userB_status_created',
      background: true
    },
    {
      key: { userA_Id: 1, userB_Id: 1 },
      name: 'unique_match',
      unique: true,
      background: true
    },
    {
      key: { status: 1, createdAt: -1 },
      name: 'match_status_created',
      background: true
    }
  ],
  jobs: [
    {
      key: { userId: 1, createdAt: -1 },
      name: 'user_jobs_created',
      background: true
    },
    {
      key: { isPublic: 1, location: 1, createdAt: -1 },
      name: 'public_jobs_location',
      background: true
    },
    {
      key: { isPublic: 1, jobType: 1, createdAt: -1 },
      name: 'public_jobs_type',
      background: true
    },
    {
      key: { isPublic: 1, workStyle: 1, createdAt: -1 },
      name: 'public_jobs_workstyle',
      background: true
    },
    {
      key: { isPublic: 1, companyIndustry: 1, createdAt: -1 },
      name: 'public_jobs_industry',
      background: true
    },
    {
      key: { title: 'text', description: 'text', companyName: 'text', skillsRequired: 'text' },
      name: 'job_text_search',
      background: true
    }
  ],
  chatmessages: [
    {
      key: { matchId: 1, createdAt: 1 },
      name: 'chat_conversation_order',
      background: true
    },
    {
      key: { senderId: 1, createdAt: -1 },
      name: 'sender_messages',
      background: true
    }
  ],
  companyreviews: [
    {
      key: { companyId: 1, createdAt: -1 },
      name: 'company_reviews_created',
      background: true
    },
    {
      key: { reviewerUserId: 1, createdAt: -1 },
      name: 'reviewer_reviews_created',
      background: true
    },
    {
      key: { companyId: 1, 'responsivenessRating': 1 },
      name: 'company_rating_responsiveness',
      background: true
    },
    {
      key: { companyId: 1, 'communicationRating': 1 },
      name: 'company_rating_communication',
      background: true
    }
  ],
  notifications: [
    {
      key: { userId: 1, isRead: 1, createdAt: -1 },
      name: 'user_notifications_read',
      background: true
    },
    {
      key: { userId: 1, type: 1, createdAt: -1 },
      name: 'user_notifications_type',
      background: true
    }
  ],
  diaryposts: [
    {
      key: { userId: 1, createdAt: -1 },
      name: 'user_diary_created',
      background: true
    },
    {
      key: { userId: 1, visibility: 1, createdAt: -1 },
      name: 'user_diary_visibility',
      background: true
    },
    {
      key: { title: 'text', content: 'text', tags: 'text' },
      name: 'diary_text_search',
      background: true
    }
  ],
  industryevents: [
    {
      key: { startDateTime: 1, isPublic: 1 },
      name: 'events_date_public',
      background: true
    },
    {
      key: { eventType: 1, startDateTime: 1 },
      name: 'events_type_date',
      background: true
    },
    {
      key: { 'location.city': 1, startDateTime: 1 },
      name: 'events_location_date',
      background: true
    }
  ],
  usereventinteractions: [
    {
      key: { userId: 1, eventId: 1, interactionType: 1 },
      name: 'user_event_interaction_unique',
      unique: true,
      background: true
    },
    {
      key: { userId: 1, interactionType: 1, createdAt: -1 },
      name: 'user_interactions_type',
      background: true
    }
  ],
  followupreminders: [
    {
      key: { userId: 1, status: 1, scheduledDate: 1 },
      name: 'user_reminders_status_date',
      background: true
    },
    {
      key: { matchId: 1, status: 1 },
      name: 'match_reminders_status',
      background: true
    }
  ]
};

async function createIndexes() {
  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('🔍 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    console.log('🚀 Starting index creation...\n');

    let totalIndexes = 0;
    let createdIndexes = 0;

    for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
      console.log(`📊 Processing ${collectionName} collection...`);
      
      const collection = db.collection(collectionName);
      
      for (const indexConfig of collectionIndexes) {
        try {
          totalIndexes++;
          const result = await collection.createIndex(indexConfig.key, {
            name: indexConfig.name,
            background: indexConfig.background || true,
            unique: indexConfig.unique || false
          });
          
          console.log(`   ✅ Created index: ${indexConfig.name}`);
          createdIndexes++;
          
        } catch (error) {
          if (error.code === 85) {
            console.log(`   ⚠️  Index ${indexConfig.name} already exists`);
          } else if (error.code === 11000) {
            console.log(`   ⚠️  Duplicate key error for ${indexConfig.name}, skipping...`);
          } else {
            console.error(`   ❌ Error creating index ${indexConfig.name}:`, error.message);
          }
        }
      }
      console.log('');
    }

    console.log(`🎉 Index creation completed!`);
    console.log(`📈 Total indexes processed: ${totalIndexes}`);
    console.log(`✅ Successfully created: ${createdIndexes}`);

    // Verify indexes
    console.log('\n🔍 Verifying indexes...');
    for (const collectionName of Object.keys(indexes)) {
      const collection = db.collection(collectionName);
      const indexList = await collection.indexes();
      console.log(`📋 ${collectionName}: ${indexList.length - 1} indexes (excluding _id)`);
    }

  } catch (error) {
    console.error('❌ Error during index creation:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Connection closed');
  }
}

// Execute if run directly
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log('✨ Process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Process failed:', error);
      process.exit(1);
    });
}

module.exports = { createIndexes, indexes };