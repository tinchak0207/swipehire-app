import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { EventFormat, EventsResponse, EventType, IndustryEvent } from '@/lib/types';

// Mock data for events (in production, this would come from database)
const mockEvents: IndustryEvent[] = [
  {
    id: '1',
    title: 'AI in Recruitment: Future Trends & Best Practices',
    description:
      'Join industry leaders to explore how artificial intelligence is revolutionizing the recruitment landscape. Learn about the latest AI tools, best practices for implementation, and future trends that will shape how we hire talent.',
    shortDescription: 'Explore AI trends in recruitment with industry leaders',
    eventType: 'conference' as EventType,
    format: 'hybrid' as EventFormat,
    location: {
      type: 'hybrid' as EventFormat,
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
        id: 'speaker-1',
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
    isSaved: false,
    isRegistered: false,
    isAttended: false,
  },
  {
    id: '2',
    title: 'Remote Work Culture Workshop',
    description:
      'Learn how to build and maintain a strong culture in distributed teams. This hands-on workshop covers communication strategies, team building activities, and tools for remote collaboration.',
    shortDescription: 'Build strong remote work culture',
    eventType: 'workshop' as EventType,
    format: 'virtual' as EventFormat,
    location: {
      type: 'virtual' as EventFormat,
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
        id: 'speaker-2',
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
    isSaved: true,
    isRegistered: false,
    isAttended: false,
  },
  {
    id: '3',
    title: 'Software Engineering Career Fair 2025',
    description:
      'Connect with top tech companies hiring software engineers. Meet recruiters, learn about open positions, and discover career opportunities at leading technology companies.',
    shortDescription: 'Connect with top tech companies',
    eventType: 'job_fair' as EventType,
    format: 'in_person' as EventFormat,
    location: {
      type: 'in_person' as EventFormat,
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
    isSaved: false,
    isRegistered: true,
    isAttended: false,
  },
  {
    id: '4',
    title: 'Women in Tech Leadership Summit',
    description:
      'Empowering women in technology to break barriers, advance their careers, and lead with confidence. Network with industry leaders, learn from successful professionals, and discover strategies for career advancement.',
    shortDescription: 'Empowering women in tech leadership',
    eventType: 'conference' as EventType,
    format: 'hybrid' as EventFormat,
    location: {
      type: 'hybrid' as EventFormat,
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
    organizer: 'Women in Tech Foundation',
    organizerLogo: '/api/placeholder/logo/womentech.png',
    organizerWebsite: 'https://womenintechfoundation.org',
    industry: ['Technology', 'Leadership', 'Diversity & Inclusion'],
    tags: ['Women in Tech', 'Leadership', 'Career Development', 'Networking'],
    targetAudience: ['Women in Tech', 'Tech Leaders', 'Diversity Advocates'],
    skillLevel: 'intermediate',
    registrationUrl: 'https://womenintechsummit.com/register',
    price: 199,
    currency: 'USD',
    isFree: false,
    capacity: 800,
    registeredCount: 623,
    waitlistAvailable: true,
    imageUrl: '/api/placeholder/event/women-tech-summit.jpg',
    bannerUrl: '/api/placeholder/banner/women-tech-summit.jpg',
    speakers: [
      {
        id: 'speaker-3',
        name: 'Elena Rodriguez',
        title: 'CTO',
        company: 'InnovateAI',
        bio: 'Pioneering technologist and advocate for women in STEM',
        imageUrl: '/api/placeholder/speaker/elena-rodriguez.jpg',
        linkedinUrl: 'https://linkedin.com/in/elenarodriguez',
      },
      {
        id: 'speaker-4',
        name: 'Dr. Priya Patel',
        title: 'VP of Engineering',
        company: 'CloudTech Solutions',
        bio: 'Expert in cloud architecture and team leadership',
        imageUrl: '/api/placeholder/speaker/priya-patel.jpg',
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
  },
  {
    id: '5',
    title: 'Digital Marketing Bootcamp: 2025 Strategies',
    description:
      'Intensive 3-day bootcamp covering the latest digital marketing trends, AI-powered marketing tools, and data-driven strategies. Perfect for marketers looking to upskill for 2025.',
    shortDescription: 'Master 2025 digital marketing strategies',
    eventType: 'bootcamp' as EventType,
    format: 'virtual' as EventFormat,
    location: {
      type: 'virtual' as EventFormat,
      platform: 'Zoom',
      meetingUrl: 'https://zoom.us/j/digitalmarketing2025',
    },
    startDateTime: '2025-07-28T09:00:00Z',
    endDateTime: '2025-07-30T17:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: 'Digital Growth Academy',
    organizerLogo: '/api/placeholder/logo/digitalgrowth.png',
    organizerWebsite: 'https://digitalgrowthacademy.com',
    industry: ['Marketing', 'Digital', 'E-commerce'],
    tags: ['Digital Marketing', 'AI Marketing', 'Growth Hacking', 'Analytics'],
    targetAudience: ['Digital Marketers', 'Growth Managers', 'Marketing Directors'],
    skillLevel: 'intermediate',
    registrationUrl: 'https://digitalgrowth.academy/bootcamp-2025',
    price: 497,
    currency: 'USD',
    isFree: false,
    capacity: 150,
    registeredCount: 89,
    waitlistAvailable: false,
    imageUrl: '/api/placeholder/event/digital-marketing-bootcamp.jpg',
    speakers: [
      {
        id: 'speaker-5',
        name: 'Alex Thompson',
        title: 'Digital Marketing Director',
        company: 'GrowthCorp',
        bio: 'Growth marketing expert with 10+ years of experience',
        imageUrl: '/api/placeholder/speaker/alex-thompson.jpg',
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
  },
  {
    id: '6',
    title: 'Startup Pitch Competition & Networking',
    description:
      'Watch promising startups pitch to investors and network with entrepreneurs, VCs, and industry professionals. Great opportunity to discover emerging companies and connect with the startup ecosystem.',
    shortDescription: 'Startup pitches and entrepreneurship networking',
    eventType: 'networking' as EventType,
    format: 'in_person' as EventFormat,
    location: {
      type: 'in_person' as EventFormat,
      city: 'Austin',
      state: 'TX',
      country: 'United States',
      venue: 'Austin Convention Center',
      address: '500 E Cesar Chavez St, Austin, TX 78701',
    },
    startDateTime: '2025-08-05T18:00:00Z',
    endDateTime: '2025-08-05T21:00:00Z',
    timezone: 'America/Chicago',
    organizer: 'Austin Startup Network',
    organizerLogo: '/api/placeholder/logo/austinstartup.png',
    organizerWebsite: 'https://austinstartupnetwork.com',
    industry: ['Startups', 'Venture Capital', 'Entrepreneurship'],
    tags: ['Startups', 'Pitch Competition', 'Networking', 'Venture Capital'],
    targetAudience: ['Entrepreneurs', 'Investors', 'Startup Employees'],
    skillLevel: 'all_levels',
    registrationUrl: 'https://austinstartup.network/pitch-night',
    price: 25,
    currency: 'USD',
    isFree: false,
    capacity: 300,
    registeredCount: 267,
    waitlistAvailable: true,
    imageUrl: '/api/placeholder/event/startup-pitch.jpg',
    speakers: [
      {
        id: 'speaker-6',
        name: 'Jordan Kim',
        title: 'Managing Partner',
        company: 'Texas Ventures',
        bio: 'Experienced investor focusing on early-stage tech startups',
        imageUrl: '/api/placeholder/speaker/jordan-kim.jpg',
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
  },
  {
    id: '7',
    title: 'Cybersecurity Awareness Workshop',
    description:
      'Essential cybersecurity training for professionals in all industries. Learn about threat prevention, incident response, and best practices for protecting your organization from cyber attacks.',
    shortDescription: 'Essential cybersecurity training for professionals',
    eventType: 'workshop' as EventType,
    format: 'virtual' as EventFormat,
    location: {
      type: 'virtual' as EventFormat,
      platform: 'Microsoft Teams',
      meetingUrl: 'https://teams.microsoft.com/cybersecurity-workshop',
    },
    startDateTime: '2025-07-25T13:00:00Z',
    endDateTime: '2025-07-25T16:00:00Z',
    timezone: 'America/New_York',
    organizer: 'CyberSafe Institute',
    organizerLogo: '/api/placeholder/logo/cybersafe.png',
    organizerWebsite: 'https://cybersafeinstitute.org',
    industry: ['Cybersecurity', 'Information Technology', 'Compliance'],
    tags: ['Cybersecurity', 'IT Security', 'Risk Management', 'Compliance'],
    targetAudience: ['IT Professionals', 'Security Analysts', 'Business Leaders'],
    skillLevel: 'beginner',
    registrationUrl: 'https://cybersafe.institute/workshop',
    price: 0,
    currency: 'USD',
    isFree: true,
    capacity: 500,
    registeredCount: 234,
    waitlistAvailable: false,
    imageUrl: '/api/placeholder/event/cybersecurity-workshop.jpg',
    speakers: [
      {
        id: 'speaker-7',
        name: 'Michael Davis',
        title: 'Chief Security Officer',
        company: 'SecureTech Solutions',
        bio: 'Cybersecurity expert with 15+ years in threat prevention',
        imageUrl: '/api/placeholder/speaker/michael-davis.jpg',
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
  },
  {
    id: '8',
    title: 'Product Management Excellence Conference',
    description:
      'Premier conference for product managers featuring sessions on product strategy, user research, roadmap planning, and cross-functional collaboration. Learn from top product leaders at major tech companies.',
    shortDescription: 'Premier product management conference',
    eventType: 'conference' as EventType,
    format: 'hybrid' as EventFormat,
    location: {
      type: 'hybrid' as EventFormat,
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
    organizer: 'Product Leaders Association',
    organizerLogo: '/api/placeholder/logo/productleaders.png',
    organizerWebsite: 'https://productleaders.org',
    industry: ['Product Management', 'Technology', 'Business Strategy'],
    tags: ['Product Management', 'Strategy', 'User Research', 'Product Design'],
    targetAudience: ['Product Managers', 'Product Directors', 'UX Researchers'],
    skillLevel: 'intermediate',
    registrationUrl: 'https://pmexcellence.com/register',
    price: 399,
    currency: 'USD',
    isFree: false,
    capacity: 600,
    registeredCount: 445,
    waitlistAvailable: true,
    imageUrl: '/api/placeholder/event/product-conference.jpg',
    bannerUrl: '/api/placeholder/banner/product-conference.jpg',
    speakers: [
      {
        id: 'speaker-8',
        name: 'Lisa Chang',
        title: 'VP of Product',
        company: 'TechGiant Inc',
        bio: 'Product leader with experience scaling products to millions of users',
        imageUrl: '/api/placeholder/speaker/lisa-chang.jpg',
        linkedinUrl: 'https://linkedin.com/in/lisachang',
      },
      {
        id: 'speaker-9',
        name: 'David Wilson',
        title: 'Chief Product Officer',
        company: 'InnovateCorp',
        bio: 'Strategic product executive and startup advisor',
        imageUrl: '/api/placeholder/speaker/david-wilson.jpg',
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
  },
  {
    id: '9',
    title: 'DevOps & Cloud Infrastructure Meetup',
    description:
      'Monthly meetup for DevOps engineers and cloud professionals. This month: Kubernetes best practices, serverless architectures, and infrastructure as code. Includes hands-on demos and networking.',
    shortDescription: 'Monthly DevOps and cloud meetup',
    eventType: 'meetup' as EventType,
    format: 'in_person' as EventFormat,
    location: {
      type: 'in_person' as EventFormat,
      city: 'Denver',
      state: 'CO',
      country: 'United States',
      venue: 'Denver Tech Center',
      address: '7800 E Orchard Rd, Greenwood Village, CO 80111',
    },
    startDateTime: '2025-07-30T18:30:00Z',
    endDateTime: '2025-07-30T21:00:00Z',
    timezone: 'America/Denver',
    organizer: 'Denver DevOps Community',
    organizerLogo: '/api/placeholder/logo/denverdevops.png',
    organizerWebsite: 'https://denverdevops.org',
    industry: ['DevOps', 'Cloud Computing', 'Software Engineering'],
    tags: ['DevOps', 'Kubernetes', 'Cloud', 'Infrastructure'],
    targetAudience: ['DevOps Engineers', 'Cloud Architects', 'Site Reliability Engineers'],
    skillLevel: 'intermediate',
    registrationUrl: 'https://meetup.com/denver-devops/events/kubernetes-july',
    price: 0,
    currency: 'USD',
    isFree: true,
    capacity: 80,
    registeredCount: 67,
    waitlistAvailable: true,
    imageUrl: '/api/placeholder/event/devops-meetup.jpg',
    speakers: [
      {
        id: 'speaker-10',
        name: 'Sarah Williams',
        title: 'Principal DevOps Engineer',
        company: 'CloudFirst Technologies',
        bio: 'Kubernetes expert and infrastructure automation specialist',
        imageUrl: '/api/placeholder/speaker/sarah-williams.jpg',
        githubUrl: 'https://github.com/sarahwilliams',
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
  },
  {
    id: '10',
    title: 'Data Science & Analytics Summit',
    description:
      'Two-day summit covering advanced data science techniques, machine learning applications, and business analytics. Features case studies from industry leaders and hands-on workshops with cutting-edge tools.',
    shortDescription: 'Advanced data science and analytics summit',
    eventType: 'conference' as EventType,
    format: 'virtual' as EventFormat,
    location: {
      type: 'virtual' as EventFormat,
      platform: 'Zoom',
      meetingUrl: 'https://zoom.us/datascience-summit-2025',
    },
    startDateTime: '2025-08-12T09:00:00Z',
    endDateTime: '2025-08-13T17:00:00Z',
    timezone: 'America/New_York',
    organizer: 'Analytics Professionals Network',
    organizerLogo: '/api/placeholder/logo/analyticsnetwork.png',
    organizerWebsite: 'https://analyticsnetwork.org',
    industry: ['Data Science', 'Analytics', 'Machine Learning'],
    tags: ['Data Science', 'Machine Learning', 'Analytics', 'Big Data'],
    targetAudience: ['Data Scientists', 'Data Analysts', 'ML Engineers'],
    skillLevel: 'advanced',
    registrationUrl: 'https://datasciencesummit.org/2025',
    price: 349,
    currency: 'USD',
    isFree: false,
    capacity: 1200,
    registeredCount: 834,
    waitlistAvailable: false,
    imageUrl: '/api/placeholder/event/data-science-summit.jpg',
    bannerUrl: '/api/placeholder/banner/data-science-summit.jpg',
    speakers: [
      {
        id: 'speaker-11',
        name: 'Dr. Raj Patel',
        title: 'Chief Data Scientist',
        company: 'DataCorp Analytics',
        bio: 'Leading researcher in machine learning and predictive analytics',
        imageUrl: '/api/placeholder/speaker/raj-patel.jpg',
        linkedinUrl: 'https://linkedin.com/in/rajpatel',
      },
      {
        id: 'speaker-12',
        name: 'Jennifer Lee',
        title: 'Head of Data Science',
        company: 'AI Innovations',
        bio: 'Expert in deep learning and natural language processing',
        imageUrl: '/api/placeholder/speaker/jennifer-lee.jpg',
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
  },
  {
    id: '11',
    title: 'UX/UI Design Workshop: Design Systems',
    description:
      'Hands-on workshop for designers learning to create and maintain design systems. Cover component libraries, design tokens, documentation, and cross-team collaboration strategies.',
    shortDescription: 'Hands-on design systems workshop',
    eventType: 'workshop' as EventType,
    format: 'in_person' as EventFormat,
    location: {
      type: 'in_person' as EventFormat,
      city: 'Portland',
      state: 'OR',
      country: 'United States',
      venue: 'Portland Design Center',
      address: '1234 Design Ave, Portland, OR 97205',
    },
    startDateTime: '2025-08-02T10:00:00Z',
    endDateTime: '2025-08-02T16:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: 'Pacific Northwest Design Guild',
    organizerLogo: '/api/placeholder/logo/pnwdesign.png',
    organizerWebsite: 'https://pnwdesign.org',
    industry: ['Design', 'User Experience', 'Technology'],
    tags: ['UX Design', 'UI Design', 'Design Systems', 'Figma'],
    targetAudience: ['UX Designers', 'UI Designers', 'Product Designers'],
    skillLevel: 'intermediate',
    registrationUrl: 'https://pnwdesign.org/design-systems-workshop',
    price: 125,
    currency: 'USD',
    isFree: false,
    capacity: 40,
    registeredCount: 38,
    waitlistAvailable: true,
    imageUrl: '/api/placeholder/event/ux-workshop.jpg',
    speakers: [
      {
        id: 'speaker-13',
        name: 'Maria Gonzalez',
        title: 'Senior UX Designer',
        company: 'DesignFlow Studios',
        bio: 'Design systems expert with experience at major tech companies',
        imageUrl: '/api/placeholder/speaker/maria-gonzalez.jpg',
        portfolioUrl: 'https://mariagonzalez.design',
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
  },
  {
    id: '12',
    title: 'Sales Leadership Masterclass',
    description:
      'Intensive masterclass for sales leaders covering advanced sales strategies, team management, revenue operations, and customer success integration. Learn from top-performing sales executives.',
    shortDescription: 'Advanced sales leadership training',
    eventType: 'seminar' as EventType,
    format: 'hybrid' as EventFormat,
    location: {
      type: 'hybrid' as EventFormat,
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
    organizer: 'Sales Excellence Institute',
    organizerLogo: '/api/placeholder/logo/salesexcellence.png',
    organizerWebsite: 'https://salesexcellence.org',
    industry: ['Sales', 'Business Development', 'Revenue Operations'],
    tags: ['Sales Leadership', 'Revenue Operations', 'Team Management', 'B2B Sales'],
    targetAudience: ['Sales Directors', 'Sales VPs', 'Revenue Leaders'],
    skillLevel: 'advanced',
    registrationUrl: 'https://salesexcellence.org/masterclass',
    price: 799,
    currency: 'USD',
    isFree: false,
    capacity: 120,
    registeredCount: 94,
    waitlistAvailable: false,
    imageUrl: '/api/placeholder/event/sales-masterclass.jpg',
    speakers: [
      {
        id: 'speaker-14',
        name: 'Robert Martinez',
        title: 'VP of Sales',
        company: 'Enterprise Solutions Inc',
        bio: 'Sales leader with 20+ years building high-performing teams',
        imageUrl: '/api/placeholder/speaker/robert-martinez.jpg',
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
        (event) => new Date(event.startDateTime) >= new Date(validatedParams.startDate!)
      );
    }
    if (validatedParams.endDate) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.startDateTime) <= new Date(validatedParams.endDate!)
      );
    }

    // Filter by price range
    if (validatedParams.minPrice !== undefined) {
      filteredEvents = filteredEvents.filter(
        (event) => (event.price || 0) >= validatedParams.minPrice!
      );
    }
    if (validatedParams.maxPrice !== undefined) {
      filteredEvents = filteredEvents.filter(
        (event) => (event.price || 0) <= validatedParams.maxPrice!
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
