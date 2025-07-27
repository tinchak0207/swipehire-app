import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EventFormat, type EventsResponse, EventType, type IndustryEvent } from '@/lib/types';

// Mock data for events (in production, this would come from database)
const mockEvents: IndustryEvent[] = [
  {
    id: '1',
    title: 'AI in Recruitment: Future Trends & Best Practices',
    description:
      'Join industry leaders to explore how artificial intelligence is revolutionizing the recruitment landscape. Learn about the latest AI tools, best practices for implementation, and future trends that will shape how we hire talent.',
    eventType: EventType.CONFERENCE,
    format: EventFormat.HYBRID,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'San Francisco',
      country: 'United States',
      address: '747 Howard St, San Francisco, CA 94103',
    },
    startDateTime: '2025-08-15T09:00:00Z',
    endDateTime: '2025-08-15T17:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: {
      name: 'TechHR Conference',
      email: 'info@techhr.com',
      website: 'https://techhr.com',
      logoUrl: '/api/placeholder/logo/techhr.png',
    },
    industry: ['Technology'],
    tags: ['AI', 'Recruitment', 'HR Tech', 'Innovation'],
    targetAudience: ['HR Professionals', 'Recruiters', 'Tech Leaders'],
    registrationUrl: 'https://eventbrite.com/e/ai-recruitment-conference',
    isFree: false,
    price: 299,
    currency: 'USD',
    registeredCount: 342,
    status: 'upcoming',
    skills: ['AI', 'Recruitment', 'HR Tech'],
    bannerUrl: '/api/placeholder/event/ai-recruitment.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-1',
        name: 'Dr. Sarah Chen',
        title: 'VP of People Analytics',
        company: 'TechCorp',
        bio: 'Leading expert in AI-driven talent acquisition',
        photoUrl: '/api/placeholder/speaker/sarah-chen.jpg',
      },
    ],
    recommendationReasons: ['Based on your HR Technology interests', 'Popular in your area'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '2',
    title: 'Remote Work Culture Workshop',
    description:
      'Learn how to build and maintain a strong culture in distributed teams. This hands-on workshop covers communication strategies, team building activities, and tools for remote collaboration.',
    eventType: EventType.WORKSHOP,
    format: EventFormat.VIRTUAL,
    location: {
      type: EventFormat.VIRTUAL,
      platform: 'Microsoft Teams',
      meetingUrl: 'https://teams.microsoft.com/join/workshop-remote-culture',
    },
    startDateTime: '2025-08-20T14:00:00Z',
    endDateTime: '2025-08-20T16:00:00Z',
    timezone: 'America/New_York',
    organizer: { name: 'Remote Work Institute' },
    industry: ['Technology'],
    tags: ['Remote Work', 'Culture', 'Team Building', 'Management'],
    targetAudience: ['Managers', 'Team Leads', 'HR Professionals'],
    registrationUrl: 'https://remotework.institute/workshop',
    isFree: true,
    registeredCount: 78,
    status: 'upcoming',
    skills: ['Remote Work', 'Culture', 'Management'],
    bannerUrl: '/api/placeholder/event/remote-culture.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-2',
        name: 'Marcus Johnson',
        title: 'Remote Work Consultant',
        company: 'Distributed Teams Inc',
        bio: 'Expert in remote team management and culture building',
        photoUrl: '/api/placeholder/speaker/marcus-johnson.jpg',
      },
    ],
    featured: false,
    recommendationScore: 87,
    recommendationReasons: ['Matches your remote work interests'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
    isSaved: true,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '3',
    title: 'Software Engineering Career Fair 2025',
    description:
      'Connect with top tech companies hiring software engineers. Meet recruiters, learn about open positions, and discover career opportunities at leading technology companies.',
    eventType: EventType.JOB_FAIR,
    format: EventFormat.IN_PERSON,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'Seattle',
      state: 'WA',
      country: 'United States',
      venue: 'Seattle Convention Center',
      address: '705 Pike St, Seattle, WA 98101',
    },
    startDateTime: '2025-09-05T10:00:00Z',
    endDateTime: '2025-09-05T18:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: { name: 'TechTalent Events' },
    industry: ['Technology'],
    tags: ['Job Fair', 'Software Engineering', 'Career', 'Networking'],
    targetAudience: ['Software Engineers', 'Developers', 'Job Seekers'],
    registrationUrl: 'https://techtalent.events/career-fair-2024',
    isFree: true,
    registeredCount: 756,
    status: 'upcoming',
    skills: ['Software Engineering', 'Career', 'Networking'],
    bannerUrl: '/api/placeholder/event/career-fair.jpg',
    agenda: [],
    speakers: [],
    featured: true,
    recommendationScore: 92,
    recommendationReasons: ['Perfect for software engineering careers', 'In your location'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
    isSaved: false,
    isRegistered: true,
    isAttended: false,
    isActive: true,
  },
  {
    id: '4',
    title: 'Women in Tech Leadership Summit',
    description:
      'Empowering women in technology to break barriers, advance their careers, and lead with confidence. Network with industry leaders, learn from successful professionals, and discover strategies for career advancement.',
    eventType: EventType.CONFERENCE,
    format: EventFormat.HYBRID,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'New York',
      state: 'NY',
      country: 'United States',
      venue: 'Jacob K. Javits Convention Center',
      address: '429 11th Ave, New York, NY 10001',
      platform: 'Zoom',
    },
    startDateTime: '2025-07-22T09:00:00Z',
    endDateTime: '2025-07-22T18:00:00Z',
    timezone: 'America/New_York',
    organizer: {
      name: 'Women in Tech Foundation',
      logoUrl: '/api/placeholder/logo/womentech.png',
      website: 'https://womenintechfoundation.org',
    },
    industry: ['Technology'],
    tags: ['Women in Tech', 'Leadership', 'Career Development', 'Networking'],
    targetAudience: ['Women in Tech', 'Tech Leaders', 'Diversity Advocates'],
    registrationUrl: 'https://womenintechsummit.com/register',
    isFree: false,
    price: 199,
    currency: 'USD',
    registeredCount: 623,
    status: 'upcoming',
    skills: ['Leadership', 'Career Development', 'Networking'],
    bannerUrl: '/api/placeholder/banner/women-tech-summit.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-3',
        name: 'Elena Rodriguez',
        title: 'CTO',
        company: 'InnovateAI',
        bio: 'Pioneering technologist and advocate for women in STEM',
        photoUrl: '/api/placeholder/speaker/elena-rodriguez.jpg',
        linkedinUrl: 'https://linkedin.com/in/elenarodriguez',
      },
      {
        id: 'speaker-4',
        name: 'Dr. Priya Patel',
        title: 'VP of Engineering',
        company: 'CloudTech Solutions',
        bio: 'Expert in cloud architecture and team leadership',
        photoUrl: '/api/placeholder/speaker/priya-patel.jpg',
        linkedinUrl: 'https://linkedin.com/in/priyapatel',
      },
    ],
    featured: true,
    recommendationScore: 93,
    recommendationReasons: [
      'Based on your tech leadership interests',
      'Highly rated by similar professionals',
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '5',
    title: 'Digital Marketing Bootcamp: 2025 Strategies',
    description:
      'Intensive 3-day bootcamp covering the latest digital marketing trends, AI-powered marketing tools, and data-driven strategies. Perfect for marketers looking to upskill for 2025.',
    eventType: EventType.WEBINAR,
    format: EventFormat.VIRTUAL,
    location: {
      type: EventFormat.VIRTUAL,
      platform: 'Zoom',
      meetingUrl: 'https://zoom.us/j/digitalmarketing2025',
    },
    startDateTime: '2025-07-28T09:00:00Z',
    endDateTime: '2025-07-30T17:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: {
      name: 'Digital Growth Academy',
      logoUrl: '/api/placeholder/logo/digitalgrowth.png',
      website: 'https://digitalgrowthacademy.com',
    },
    industry: ['Marketing'],
    tags: ['Digital Marketing', 'AI Marketing', 'Growth Hacking', 'Analytics'],
    targetAudience: ['Digital Marketers', 'Growth Managers', 'Marketing Directors'],
    registrationUrl: 'https://digitalgrowth.academy/bootcamp-2025',
    isFree: false,
    price: 497,
    currency: 'USD',
    registeredCount: 89,
    status: 'upcoming',
    skills: ['Digital Marketing', 'AI Marketing', 'Growth Hacking'],
    bannerUrl: '/api/placeholder/event/digital-marketing-bootcamp.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-5',
        name: 'Alex Thompson',
        title: 'Digital Marketing Director',
        company: 'GrowthCorp',
        bio: 'Growth marketing expert with 10+ years of experience',
        photoUrl: '/api/placeholder/speaker/alex-thompson.jpg',
        twitterUrl: 'https://twitter.com/alexthompson',
      },
    ],
    featured: false,
    recommendationScore: 85,
    recommendationReasons: ['Matches your marketing interests', 'High-quality content'],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '6',
    title: 'Startup Pitch Competition & Networking',
    description:
      'Watch promising startups pitch to investors and network with entrepreneurs, VCs, and industry professionals. Great opportunity to discover emerging companies and connect with the startup ecosystem.',
    eventType: EventType.NETWORKING,
    format: EventFormat.IN_PERSON,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'Austin',
      state: 'TX',
      country: 'United States',
      venue: 'Austin Convention Center',
      address: '500 E Cesar Chavez St, Austin, TX 78701',
    },
    startDateTime: '2025-08-05T18:00:00Z',
    endDateTime: '2025-08-05T21:00:00Z',
    timezone: 'America/Chicago',
    organizer: {
      name: 'Austin Startup Network',
      logoUrl: '/api/placeholder/logo/austinstartup.png',
      website: 'https://austinstartupnetwork.com',
    },
    industry: ['Startups'],
    tags: ['Startups', 'Pitch Competition', 'Networking', 'Venture Capital'],
    targetAudience: ['Entrepreneurs', 'Investors', 'Startup Employees'],
    registrationUrl: 'https://austinstartup.network/pitch-night',
    isFree: false,
    price: 25,
    currency: 'USD',
    registeredCount: 267,
    status: 'upcoming',
    skills: ['Startups', 'Pitch Competition', 'Networking'],
    bannerUrl: '/api/placeholder/event/startup-pitch.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-6',
        name: 'Jordan Kim',
        title: 'Managing Partner',
        company: 'Texas Ventures',
        bio: 'Experienced investor focusing on early-stage tech startups',
        photoUrl: '/api/placeholder/speaker/jordan-kim.jpg',
        linkedinUrl: 'https://linkedin.com/in/jordankim',
      },
    ],
    featured: false,
    recommendationScore: 78,
    recommendationReasons: ['Great for networking', 'Active startup scene'],
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-05T00:00:00Z',
    isSaved: true,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '7',
    title: 'Cybersecurity Awareness Workshop',
    description:
      'Essential cybersecurity training for professionals in all industries. Learn about threat prevention, incident response, and best practices for protecting your organization from cyber attacks.',
    eventType: EventType.WORKSHOP,
    format: EventFormat.VIRTUAL,
    location: {
      type: EventFormat.VIRTUAL,
      platform: 'Microsoft Teams',
      meetingUrl: 'https://teams.microsoft.com/cybersecurity-workshop',
    },
    startDateTime: '2025-07-25T13:00:00Z',
    endDateTime: '2025-07-25T16:00:00Z',
    timezone: 'America/New_York',
    organizer: {
      name: 'CyberSafe Institute',
      logoUrl: '/api/placeholder/logo/cybersafe.png',
      website: 'https://cybersafeinstitute.org',
    },
    industry: ['Cybersecurity'],
    tags: ['Cybersecurity', 'IT Security', 'Risk Management', 'Compliance'],
    targetAudience: ['IT Professionals', 'Security Analysts', 'Business Leaders'],
    registrationUrl: 'https://cybersafe.institute/workshop',
    isFree: true,
    registeredCount: 234,
    status: 'upcoming',
    skills: ['Cybersecurity', 'IT Security', 'Risk Management'],
    bannerUrl: '/api/placeholder/event/cybersecurity-workshop.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-7',
        name: 'Michael Davis',
        title: 'Chief Security Officer',
        company: 'SecureTech Solutions',
        bio: 'Cybersecurity expert with 15+ years in threat prevention',
        photoUrl: '/api/placeholder/speaker/michael-davis.jpg',
        linkedinUrl: 'https://linkedin.com/in/michaeldavis',
      },
    ],
    featured: false,
    recommendationScore: 82,
    recommendationReasons: ['Important for all professionals', 'Free certification available'],
    createdAt: '2024-03-20T00:00:00Z',
    updatedAt: '2024-03-25T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '8',
    title: 'Product Management Excellence Conference',
    description:
      'Premier conference for product managers featuring sessions on product strategy, user research, roadmap planning, and cross-functional collaboration. Learn from top product leaders at major tech companies.',
    eventType: EventType.CONFERENCE,
    format: EventFormat.HYBRID,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'San Jose',
      state: 'CA',
      country: 'United States',
      venue: 'San Jose Convention Center',
      address: '150 W San Carlos St, San Jose, CA 95113',
      platform: 'Zoom',
    },
    startDateTime: '2025-09-10T08:00:00Z',
    endDateTime: '2025-09-11T18:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: {
      name: 'Product Leaders Association',
      logoUrl: '/api/placeholder/logo/productleaders.png',
      website: 'https://productleaders.org',
    },
    industry: ['Product Management'],
    tags: ['Product Management', 'Strategy', 'User Research', 'Product Design'],
    targetAudience: ['Product Managers', 'Product Directors', 'UX Researchers'],
    registrationUrl: 'https://pmexcellence.com/register',
    isFree: false,
    price: 399,
    currency: 'USD',
    registeredCount: 445,
    status: 'upcoming',
    skills: ['Product Management', 'Strategy', 'User Research'],
    bannerUrl: '/api/placeholder/banner/product-conference.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-8',
        name: 'Lisa Chang',
        title: 'VP of Product',
        company: 'TechGiant Inc',
        bio: 'Product leader with experience scaling products to millions of users',
        photoUrl: '/api/placeholder/speaker/lisa-chang.jpg',
        linkedinUrl: 'https://linkedin.com/in/lisachang',
      },
      {
        id: 'speaker-9',
        name: 'David Wilson',
        title: 'Chief Product Officer',
        company: 'InnovateCorp',
        bio: 'Strategic product executive and startup advisor',
        photoUrl: '/api/placeholder/speaker/david-wilson.jpg',
        twitterUrl: 'https://twitter.com/davidwilson',
      },
    ],
    featured: true,
    recommendationScore: 96,
    recommendationReasons: ['Perfect match for product management', 'Top-rated speakers'],
    createdAt: '2024-02-28T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    isSaved: true,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '9',
    title: 'DevOps & Cloud Infrastructure Meetup',
    description:
      'Monthly meetup for DevOps engineers and cloud professionals. This month: Kubernetes best practices, serverless architectures, and infrastructure as code. Includes hands-on demos and networking.',
    eventType: EventType.MEETUP,
    format: EventFormat.IN_PERSON,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'Denver',
      state: 'CO',
      country: 'United States',
      venue: 'Denver Tech Center',
      address: '7800 E Orchard Rd, Greenwood Village, CO 80111',
    },
    startDateTime: '2025-07-30T18:30:00Z',
    endDateTime: '2025-07-30T21:00:00Z',
    timezone: 'America/Denver',
    organizer: {
      name: 'Denver DevOps Community',
      logoUrl: '/api/placeholder/logo/denverdevops.png',
      website: 'https://denverdevops.org',
    },
    industry: ['DevOps'],
    tags: ['DevOps', 'Kubernetes', 'Cloud', 'Infrastructure'],
    targetAudience: ['DevOps Engineers', 'Cloud Architects', 'Site Reliability Engineers'],
    registrationUrl: 'https://meetup.com/denver-devops/events/kubernetes-july',
    isFree: true,
    registeredCount: 67,
    status: 'upcoming',
    skills: ['DevOps', 'Kubernetes', 'Cloud'],
    bannerUrl: '/api/placeholder/event/devops-meetup.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-10',
        name: 'Sarah Williams',
        title: 'Principal DevOps Engineer',
        company: 'CloudFirst Technologies',
        bio: 'Kubernetes expert and infrastructure automation specialist',
        photoUrl: '/api/placeholder/speaker/sarah-williams.jpg',
        linkedinUrl: 'https://github.com/sarahwilliams',
      },
    ],
    featured: false,
    recommendationScore: 79,
    recommendationReasons: ['Popular local meetup', 'Hands-on learning'],
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-05T00:00:00Z',
    isSaved: false,
    isRegistered: true,
    isAttended: false,
    isActive: true,
  },
  {
    id: '10',
    title: 'Data Science & Analytics Summit',
    description:
      'Two-day summit covering advanced data science techniques, machine learning applications, and business analytics. Features case studies from industry leaders and hands-on workshops with cutting-edge tools.',
    eventType: EventType.CONFERENCE,
    format: EventFormat.VIRTUAL,
    location: {
      type: EventFormat.VIRTUAL,
      platform: 'Zoom',
      meetingUrl: 'https://zoom.us/datascience-summit-2025',
    },
    startDateTime: '2025-08-12T09:00:00Z',
    endDateTime: '2025-08-13T17:00:00Z',
    timezone: 'America/New_York',
    organizer: {
      name: 'Analytics Professionals Network',
      logoUrl: '/api/placeholder/logo/analyticsnetwork.png',
      website: 'https://analyticsnetwork.org',
    },
    industry: ['Data Science'],
    tags: ['Data Science', 'Machine Learning', 'Analytics', 'Big Data'],
    targetAudience: ['Data Scientists', 'Data Analysts', 'ML Engineers'],
    registrationUrl: 'https://datasciencesummit.org/2025',
    price: 349,
    currency: 'USD',
    isFree: false,
    capacity: 1200,
    registeredCount: 834,
    status: 'upcoming',
    skills: [],
    bannerUrl: '/api/placeholder/banner/data-science-summit.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-11',
        name: 'Dr. Raj Patel',
        title: 'Chief Data Scientist',
        company: 'DataCorp Analytics',
        bio: 'Leading researcher in machine learning and predictive analytics',
        photoUrl: '/api/placeholder/speaker/raj-patel.jpg',
        linkedinUrl: 'https://linkedin.com/in/rajpatel',
      },
      {
        id: 'speaker-12',
        name: 'Jennifer Lee',
        title: 'Head of Data Science',
        company: 'AI Innovations',
        bio: 'Expert in deep learning and natural language processing',
        photoUrl: '/api/placeholder/speaker/jennifer-lee.jpg',
        twitterUrl: 'https://twitter.com/jenniferlee',
      },
    ],
    featured: true,
    recommendationScore: 91,
    recommendationReasons: ['Matches your data science background', 'Top industry speakers'],
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '11',
    title: 'UX/UI Design Workshop: Design Systems',
    description:
      'Hands-on workshop for designers learning to create and maintain design systems. Cover component libraries, design tokens, documentation, and cross-team collaboration strategies.',
    eventType: EventType.WORKSHOP,
    format: EventFormat.IN_PERSON,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'Portland',
      state: 'OR',
      country: 'United States',
      venue: 'Portland Design Center',
      address: '1234 Design Ave, Portland, OR 97205',
    },
    startDateTime: '2025-08-02T10:00:00Z',
    endDateTime: '2025-08-02T16:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: {
      name: 'Pacific Northwest Design Guild',
      logoUrl: '/api/placeholder/logo/pnwdesign.png',
      website: 'https://pnwdesign.org',
    },
    industry: ['Design'],
    tags: ['UX Design', 'UI Design', 'Design Systems', 'Figma'],
    targetAudience: ['UX Designers', 'UI Designers', 'Product Designers'],
    registrationUrl: 'https://pnwdesign.org/design-systems-workshop',
    price: 125,
    currency: 'USD',
    isFree: false,
    capacity: 40,
    registeredCount: 38,
    status: 'upcoming',
    skills: [],
    bannerUrl: '/api/placeholder/event/ux-workshop.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-13',
        name: 'Maria Gonzalez',
        title: 'Senior UX Designer',
        company: 'DesignFlow Studios',
        bio: 'Design systems expert with experience at major tech companies',
        photoUrl: '/api/placeholder/speaker/maria-gonzalez.jpg',
        linkedinUrl: 'https://mariagonzalez.design',
      },
    ],
    featured: false,
    recommendationScore: 84,
    recommendationReasons: ['Perfect for UX designers', 'Small group learning'],
    createdAt: '2024-04-10T00:00:00Z',
    updatedAt: '2024-04-15T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
  {
    id: '12',
    title: 'Sales Leadership Masterclass',
    description:
      'Intensive masterclass for sales leaders covering advanced sales strategies, team management, revenue operations, and customer success integration. Learn from top-performing sales executives.',
    eventType: EventType.SEMINAR,
    format: EventFormat.HYBRID,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'Chicago',
      state: 'IL',
      country: 'United States',
      venue: 'Chicago Business Center',
      address: '100 N Michigan Ave, Chicago, IL 60601',
      platform: 'Zoom',
    },
    startDateTime: '2025-08-18T09:00:00Z',
    endDateTime: '2025-08-19T17:00:00Z',
    timezone: 'America/Chicago',
    organizer: {
      name: 'Sales Excellence Institute',
      logoUrl: '/api/placeholder/logo/salesexcellence.png',
      website: 'https://salesexcellence.org',
    },
    industry: ['Sales'],
    tags: ['Sales Leadership', 'Revenue Operations', 'Team Management', 'B2B Sales'],
    targetAudience: ['Sales Directors', 'Sales VPs', 'Revenue Leaders'],
    registrationUrl: 'https://salesexcellence.org/masterclass',
    price: 799,
    currency: 'USD',
    isFree: false,
    capacity: 120,
    registeredCount: 94,
    status: 'upcoming',
    skills: [],
    bannerUrl: '/api/placeholder/event/sales-masterclass.jpg',
    agenda: [],
    speakers: [
      {
        id: 'speaker-14',
        name: 'Robert Martinez',
        title: 'VP of Sales',
        company: 'Enterprise Solutions Inc',
        bio: 'Sales leader with 20+ years building high-performing teams',
        photoUrl: '/api/placeholder/speaker/robert-martinez.jpg',
        linkedinUrl: 'https://linkedin.com/in/robertmartinez',
      },
    ],
    featured: false,
    recommendationScore: 88,
    recommendationReasons: ['Advanced sales content', 'Executive-level networking'],
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-03-12T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
    isActive: true,
  },
];

const eventSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sortBy: z.enum(['date', 'relevance', 'popularity', 'price']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  eventTypes: z.string().optional(),
  formats: z.string().optional(),
  industries: z.string().optional(),
  cities: z.string().optional(),
  isFree: z.coerce.boolean().optional(),
  searchQuery: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate search parameters
    const validatedParams = eventSearchSchema.parse(params);

    // Apply filtering
    let filteredEvents = [...mockEvents];

    // Filter by search query
    if (validatedParams.searchQuery) {
      const query = validatedParams.searchQuery.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          event.industry.some((ind) => ind.toLowerCase().includes(query))
      );
    }

    // Filter by event types
    if (validatedParams.eventTypes) {
      const types = validatedParams.eventTypes.split(',');
      filteredEvents = filteredEvents.filter((event) => types.includes(event.eventType));
    }

    // Filter by formats
    if (validatedParams.formats) {
      const formats = validatedParams.formats.split(',');
      filteredEvents = filteredEvents.filter((event) => formats.includes(event.format));
    }

    // Filter by industries
    if (validatedParams.industries) {
      const industries = validatedParams.industries.split(',');
      filteredEvents = filteredEvents.filter((event) =>
        event.industry.some((ind) => industries.includes(ind))
      );
    }

    // Filter by cities
    if (validatedParams.cities) {
      const cities = validatedParams.cities.split(',');
      filteredEvents = filteredEvents.filter(
        (event) => event.location.city && cities.includes(event.location.city)
      );
    }

    // Filter by free events
    if (validatedParams.isFree !== undefined) {
      filteredEvents = filteredEvents.filter((event) => event.isFree === validatedParams.isFree);
    }

    // Filter by date range
    if (validatedParams.startDate) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.startDateTime &&
          new Date(event.startDateTime) >= new Date(validatedParams.startDate as string)
      );
    }
    if (validatedParams.endDate) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.startDateTime &&
          new Date(event.startDateTime) <= new Date(validatedParams.endDate as string)
      );
    }

    // Filter by price range
    if (validatedParams.minPrice !== undefined) {
      filteredEvents = filteredEvents.filter(
        (event) => (event.price || 0) >= (validatedParams.minPrice as number)
      );
    }
    if (validatedParams.maxPrice !== undefined) {
      filteredEvents = filteredEvents.filter(
        (event) => (event.price || 0) <= (validatedParams.maxPrice as number)
      );
    }

    // Apply sorting
    filteredEvents.sort((a, b) => {
      let comparison = 0;

      switch (validatedParams.sortBy) {
        case 'date':
          comparison = new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
          break;
        case 'relevance':
          comparison = (b.recommendationScore || 0) - (a.recommendationScore || 0);
          break;
        case 'popularity':
          comparison = b.registeredCount - a.registeredCount;
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
      }

      return validatedParams.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const totalCount = filteredEvents.length;
    const startIndex = (validatedParams.page - 1) * validatedParams.limit;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + validatedParams.limit);
    const hasMore = startIndex + validatedParams.limit < totalCount;

    const response: EventsResponse = {
      events: paginatedEvents,
      totalCount,
      hasMore,
      page: validatedParams.page,
      limit: validatedParams.limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching events:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
