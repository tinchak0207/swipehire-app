const mongoose = require('mongoose');
const Event = require('./models/Event');

// Import mock events from frontend API route
const mockEvents = [
  {
    id: '1',
    title: 'AI in Recruitment: Future Trends & Best Practices',
    description: 'Join industry leaders to explore how artificial intelligence is revolutionizing the recruitment landscape. Learn about the latest AI tools, best practices for implementation, and future trends that will shape how we hire talent.',
    shortDescription: 'Explore AI trends in recruitment with industry leaders',
    eventType: 'conference',
    format: 'hybrid',
    location: {
      type: 'hybrid',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      venue: 'Moscone Center',
      address: '747 Howard St, San Francisco, CA 94103',
      platform: 'Zoom',
    },
    startDateTime: '2025-08-15T09:00:00Z',
    endDateTime: '2025-08-15T17:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: 'TechHR Conference',
    organizerLogo: '/api/placeholder/logo/techhr.png',
    organizerWebsite: 'https://techhh.com',
    industry: ['Technology', 'Human Resources'],
    tags: ['AI', 'Recruitment', 'HR Tech', 'Innovation'],
    targetAudience: ['HR Professionals', 'Recruiters', 'Tech Leaders'],
    skillLevel: 'intermediate',
    registrationUrl: 'https://eventbrite.com/e/ai-recruitment-conference',
    price: 299,
    currency: 'USD',
    isFree: false,
    capacity: 500,
    registeredCount: 342,
    waitlistAvailable: true,
    imageUrl: '/api/placeholder/event/ai-recruitment.jpg',
    bannerUrl: '/api/placeholder/banner/ai-recruitment.jpg',
    speakers: [
      {
        name: 'Dr. Sarah Chen',
        title: 'VP of People Analytics',
        company: 'TechCorp',
        bio: 'Leading expert in AI-driven talent acquisition',
        imageUrl: '/api/placeholder/speaker/sarah-chen.jpg',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
      },
    ],
    featured: true,
    recommendationScore: 95,
    recommendationReasons: ['Based on your HR Technology interests', 'Popular in your area'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '2',
    title: 'Remote Work Culture Workshop',
    description: 'Learn how to build and maintain a strong culture in distributed teams. This hands-on workshop covers communication strategies, team building activities, and tools for remote collaboration.',
    shortDescription: 'Build strong remote work culture',
    eventType: 'workshop',
    format: 'virtual',
    location: {
      type: 'virtual',
      platform: 'Microsoft Teams',
      meetingUrl: 'https://teams.microsoft.com/join/workshop-remote-culture',
    },
    startDateTime: '2025-08-20T14:00:00Z',
    endDateTime: '2025-08-20T16:00:00Z',
    timezone: 'America/New_York',
    organizer: 'Remote Work Institute',
    industry: ['Technology', 'Management', 'Human Resources'],
    tags: ['Remote Work', 'Culture', 'Team Building', 'Management'],
    targetAudience: ['Managers', 'Team Leads', 'HR Professionals'],
    skillLevel: 'beginner',
    registrationUrl: 'https://remotework.institute/workshop',
    price: 0,
    currency: 'USD',
    isFree: true,
    capacity: 100,
    registeredCount: 78,
    waitlistAvailable: false,
    imageUrl: '/api/placeholder/event/remote-culture.jpg',
    speakers: [
      {
        name: 'Marcus Johnson',
        title: 'Remote Work Consultant',
        company: 'Distributed Teams Inc',
        bio: 'Expert in remote team management and culture building',
        imageUrl: '/api/placeholder/speaker/marcus-johnson.jpg',
      },
    ],
    featured: false,
    recommendationScore: 87,
    recommendationReasons: ['Matches your remote work interests'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
  },
  {
    id: '3',
    title: 'Software Engineering Career Fair 2025',
    description: 'Connect with top tech companies hiring software engineers. Meet recruiters, learn about open positions, and discover career opportunities at leading technology companies.',
    shortDescription: 'Connect with top tech companies',
    eventType: 'job_fair',
    format: 'in_person',
    location: {
      type: 'in_person',
      city: 'Seattle',
      state: 'WA',
      country: 'United States',
      venue: 'Seattle Convention Center',
      address: '705 Pike St, Seattle, WA 98101',
    },
    startDateTime: '2025-09-05T10:00:00Z',
    endDateTime: '2025-09-05T18:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: 'TechTalent Events',
    industry: ['Technology', 'Software Engineering'],
    tags: ['Job Fair', 'Software Engineering', 'Career', 'Networking'],
    targetAudience: ['Software Engineers', 'Developers', 'Job Seekers'],
    skillLevel: 'all_levels',
    registrationUrl: 'https://techtalent.events/career-fair-2024',
    price: 0,
    currency: 'USD',
    isFree: true,
    capacity: 1000,
    registeredCount: 756,
    waitlistAvailable: false,
    imageUrl: '/api/placeholder/event/career-fair.jpg',
    speakers: [],
    featured: true,
    recommendationScore: 92,
    recommendationReasons: ['Perfect for software engineering careers', 'In your location'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  // Add more events as needed...
];

async function seedEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swipehire', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Transform and insert mock events
    const eventsToInsert = mockEvents.map(event => ({
      ...event,
      _id: undefined, // Let MongoDB generate new IDs
      status: 'published',
      viewCount: Math.floor(Math.random() * 1000),
      saveCount: Math.floor(Math.random() * 100),
      registrationClickCount: Math.floor(Math.random() * 500),
    }));

    const insertedEvents = await Event.insertMany(eventsToInsert);
    console.log(`Inserted ${insertedEvents.length} events`);

    // Log the first few events
    console.log('Sample events:');
    insertedEvents.slice(0, 3).forEach(event => {
      console.log(`- ${event.title} (${event._id})`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedEvents();
}

module.exports = { seedEvents };