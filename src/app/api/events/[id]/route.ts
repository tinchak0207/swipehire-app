import { type NextRequest, NextResponse } from 'next/server';
import { EventFormat, EventType, type IndustryEvent } from '@/lib/types';

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
    eventType: EventType.CONFERENCE,
    format: EventFormat.HYBRID,
    location: {
      type: EventFormat.IN_PERSON,
      city: 'San Francisco',
      country: 'United States',
      address: '747 Howard St, San Francisco, CA 94103',
      platform: 'Zoom',
      meetingUrl: 'https://zoom.us/j/ai-recruitment-2024',
    },
    startDateTime: '2024-08-15T09:00:00Z',
    endDateTime: '2024-08-15T17:00:00Z',
    timezone: 'America/Los_Angeles',
    organizer: { name: 'TechHR Conference' },
    industry: ['Technology'],
    tags: ['AI', 'Recruitment', 'HR Tech', 'Innovation'],
    targetAudience: ['HR Professionals', 'Recruiters', 'Tech Leaders'],
    registrationUrl: 'https://eventbrite.com/e/ai-recruitment-conference',
    bannerUrl: '/api/placeholder/event/ai-recruitment.jpg',
    agenda: [
      {
        id: 'session-1',
        startTime: '2024-08-15T09:00:00Z',
        endTime: '2024-08-15T10:00:00Z',
        title: 'Opening Keynote: The Future of AI in Recruitment',
        speakers: [{ id: 'speaker-1', name: 'Dr. Sarah Chen' }],
      },
      {
        id: 'session-2',
        startTime: '2024-08-15T10:30:00Z',
        endTime: '2024-08-15T12:00:00Z',
        title: 'Workshop: Implementing AI Tools in Your Hiring Process',
        speakers: [{ id: 'speaker-2', name: 'Marcus Rodriguez' }],
      },
      {
        id: 'session-3',
        startTime: '2024-08-15T14:00:00Z',
        endTime: '2024-08-15T15:30:00Z',
        title: 'Panel: Ethical AI in Hiring',
        speakers: [
          { id: 'speaker-3', name: 'Dr. Amira Hassan' },
          { id: 'speaker-4', name: 'James Park' },
        ],
      },
    ],
    speakers: [
      {
        id: 'speaker-1',
        name: 'Dr. Sarah Chen',
        title: 'VP of People Analytics',
        company: 'TechCorp',
        bio: 'Leading expert in AI-driven talent acquisition with 15+ years of experience',
        photoUrl: '/api/placeholder/speaker/sarah-chen.jpg',
      },
      {
        id: 'speaker-2',
        name: 'Marcus Rodriguez',
        title: 'Senior Product Manager',
        company: 'HireAI',
        bio: 'Product expert specializing in AI recruitment solutions',
        photoUrl: '/api/placeholder/speaker/marcus-rodriguez.jpg',
      },
      {
        id: 'speaker-3',
        name: 'Dr. Amira Hassan',
        title: 'AI Ethics Researcher',
        company: 'Stanford University',
        bio: 'Researcher focusing on algorithmic fairness in employment',
        photoUrl: '/api/placeholder/speaker/amira-hassan.jpg',
      },
      {
        id: 'speaker-4',
        name: 'James Park',
        title: 'Chief People Officer',
        company: 'InnovateHR',
        bio: 'Leader in implementing ethical AI practices in large organizations',
        photoUrl: '/api/placeholder/speaker/james-park.jpg',
      },
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    isSaved: false,
    isRegistered: false,
    skills: ['AI', 'Recruitment', 'HR Tech'],
    isFree: false,
    price: 299,
    currency: 'USD',
    registeredCount: 342,
    status: 'upcoming',
    isActive: true,
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
