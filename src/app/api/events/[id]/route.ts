import { type NextRequest, NextResponse } from 'next/server';
import type { IndustryEvent } from '@/lib/types';
import { EventFormat, EventType } from '@/lib/types';

// Mock data for individual event (in production, this would come from database)
const mockEventDetails: Record<string, IndustryEvent> = {
  '1': {
    id: '1',
    title: 'AI in Recruitment: Future Trends & Best Practices',
    description: `Join industry leaders to explore how artificial intelligence is revolutionizing the recruitment landscape. 

This comprehensive conference will cover:
• Latest AI tools and technologies in recruitment
• Ethical considerations in AI-powered hiring
• Best practices for implementing AI in your organization
• Future trends and predictions for the industry
• Case studies from leading companies
• Hands-on workshops with AI recruitment tools

Whether you're an HR professional, recruiter, or tech leader, this event will provide you with actionable insights to transform your hiring process and stay ahead of the curve.`,
    shortDescription: 'Explore AI trends in recruitment with industry leaders',
    eventType: EventType.CONFERENCE,
    format: EventFormat.HYBRID,
    location: {
      type: EventFormat.HYBRID,
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      venue: 'Moscone Center',
      address: '747 Howard St, San Francisco, CA 94103',
      platform: 'Zoom',
      meetingUrl: 'https://zoom.us/j/ai-recruitment-2024',
    },
    startDateTime: '2024-08-15T09:00:00Z',
    endDateTime: '2024-08-15T17:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: 'TechHR Conference',
    organizerLogo: '/api/placeholder/logo/techhr.png',
    organizerWebsite: 'https://techhr.com',
    industry: ['Technology', 'Human Resources'],
    tags: ['AI', 'Recruitment', 'HR Tech', 'Innovation'],
    targetAudience: ['HR Professionals', 'Recruiters', 'Tech Leaders'],
    skillLevel: 'intermediate' as const,
    registrationUrl: 'https://eventbrite.com/e/ai-recruitment-conference',
    price: 299,
    currency: 'USD',
    isFree: false,
    capacity: 500,
    registeredCount: 342,
    waitlistAvailable: true,
    imageUrl: '/api/placeholder/event/ai-recruitment.jpg',
    bannerUrl: '/api/placeholder/banner/ai-recruitment.jpg',
    agenda: [
      {
        id: 'session-1',
        title: 'Opening Keynote: The Future of AI in Recruitment',
        description: 'Setting the stage for AI transformation in hiring',
        startTime: '2024-08-15T09:00:00Z',
        endTime: '2024-08-15T10:00:00Z',
        speakers: [
          {
            id: 'speaker-1',
            name: 'Dr. Sarah Chen',
            title: 'VP of People Analytics',
            company: 'TechCorp',
            bio: 'Leading expert in AI-driven talent acquisition with 15+ years of experience',
            imageUrl: '/api/placeholder/speaker/sarah-chen.jpg',
            linkedinUrl: 'https://linkedin.com/in/sarahchen',
          },
        ],
        track: 'Main Stage',
      },
      {
        id: 'session-2',
        title: 'Workshop: Implementing AI Tools in Your Hiring Process',
        description: 'Hands-on session with popular AI recruitment platforms',
        startTime: '2024-08-15T10:30:00Z',
        endTime: '2024-08-15T12:00:00Z',
        speakers: [
          {
            id: 'speaker-2',
            name: 'Marcus Rodriguez',
            title: 'Senior Product Manager',
            company: 'HireAI',
            bio: 'Product expert specializing in AI recruitment solutions',
            imageUrl: '/api/placeholder/speaker/marcus-rodriguez.jpg',
            linkedinUrl: 'https://linkedin.com/in/marcusrodriguez',
          },
        ],
        track: 'Workshop Room A',
      },
      {
        id: 'session-3',
        title: 'Panel: Ethical AI in Hiring',
        description: 'Discussion on bias, fairness, and responsible AI implementation',
        startTime: '2024-08-15T14:00:00Z',
        endTime: '2024-08-15T15:30:00Z',
        speakers: [
          {
            id: 'speaker-3',
            name: 'Dr. Amira Hassan',
            title: 'AI Ethics Researcher',
            company: 'Stanford University',
            bio: 'Researcher focusing on algorithmic fairness in employment',
            imageUrl: '/api/placeholder/speaker/amira-hassan.jpg',
            linkedinUrl: 'https://linkedin.com/in/amirahassan',
          },
          {
            id: 'speaker-4',
            name: 'James Park',
            title: 'Chief People Officer',
            company: 'InnovateHR',
            bio: 'Leader in implementing ethical AI practices in large organizations',
            imageUrl: '/api/placeholder/speaker/james-park.jpg',
            linkedinUrl: 'https://linkedin.com/in/jamespark',
          },
        ],
        track: 'Main Stage',
      },
    ],
    speakers: [
      {
        id: 'speaker-1',
        name: 'Dr. Sarah Chen',
        title: 'VP of People Analytics',
        company: 'TechCorp',
        bio: 'Leading expert in AI-driven talent acquisition with 15+ years of experience',
        imageUrl: '/api/placeholder/speaker/sarah-chen.jpg',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
      },
      {
        id: 'speaker-2',
        name: 'Marcus Rodriguez',
        title: 'Senior Product Manager',
        company: 'HireAI',
        bio: 'Product expert specializing in AI recruitment solutions',
        imageUrl: '/api/placeholder/speaker/marcus-rodriguez.jpg',
        linkedinUrl: 'https://linkedin.com/in/marcusrodriguez',
      },
      {
        id: 'speaker-3',
        name: 'Dr. Amira Hassan',
        title: 'AI Ethics Researcher',
        company: 'Stanford University',
        bio: 'Researcher focusing on algorithmic fairness in employment',
        imageUrl: '/api/placeholder/speaker/amira-hassan.jpg',
        linkedinUrl: 'https://linkedin.com/in/amirahassan',
      },
      {
        id: 'speaker-4',
        name: 'James Park',
        title: 'Chief People Officer',
        company: 'InnovateHR',
        bio: 'Leader in implementing ethical AI practices in large organizations',
        imageUrl: '/api/placeholder/speaker/james-park.jpg',
        linkedinUrl: 'https://linkedin.com/in/jamespark',
      },
    ],
    featured: true,
    recommendationScore: 95,
    recommendationReasons: [
      'Based on your HR Technology interests',
      'Popular in your area',
      'Top-rated speakers',
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    isAttended: false,
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = mockEventDetails[id];

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
  }
}
