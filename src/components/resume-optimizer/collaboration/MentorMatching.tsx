import React, { useState } from 'react';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  rating: number;
  hourlyRate: number;
  available: boolean;
  responseTime: string; // e.g., "< 2 hours"
  image?: string;
}

interface MentorMatchingProps {
  targetJobTitle: string;
  onMentorSelect: (mentor: Mentor) => void;
}

const MentorMatching: React.FC<MentorMatchingProps> = ({ targetJobTitle, onMentorSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Mock mentor data based on job title
  const mockMentors: Record<string, Mentor[]> = {
    'software engineer': [
      {
        id: '1',
        name: 'Alex Johnson',
        title: 'Senior Software Engineer',
        company: 'Google',
        expertise: ['React', 'Node.js', 'System Design'],
        rating: 4.9,
        hourlyRate: 150,
        available: true,
        responseTime: '< 2 hours',
        image: '/avatars/alex.jpg',
      },
      {
        id: '2',
        name: 'Maria Garcia',
        title: 'Engineering Manager',
        company: 'Microsoft',
        expertise: ['Cloud Architecture', 'DevOps', 'Leadership'],
        rating: 4.8,
        hourlyRate: 200,
        available: true,
        responseTime: '< 4 hours',
        image: '/avatars/maria.jpg',
      },
      {
        id: '3',
        name: 'David Chen',
        title: 'Staff Software Engineer',
        company: 'Amazon',
        expertise: ['AWS', 'Microservices', 'Distributed Systems'],
        rating: 4.95,
        hourlyRate: 180,
        available: false,
        responseTime: '1 day',
        image: '/avatars/david.jpg',
      },
    ],
    'product manager': [
      {
        id: '4',
        name: 'Sarah Williams',
        title: 'Senior Product Manager',
        company: 'Meta',
        expertise: ['Product Strategy', 'Agile', 'User Research'],
        rating: 4.7,
        hourlyRate: 175,
        available: true,
        responseTime: '< 3 hours',
        image: '/avatars/sarah.jpg',
      },
      {
        id: '5',
        name: 'James Wilson',
        title: 'Product Director',
        company: 'Netflix',
        expertise: ['Product Lifecycle', 'Market Analysis', 'Go-to-Market'],
        rating: 4.85,
        hourlyRate: 220,
        available: true,
        responseTime: '< 6 hours',
        image: '/avatars/james.jpg',
      },
    ],
    'data scientist': [
      {
        id: '6',
        name: 'Priya Sharma',
        title: 'Lead Data Scientist',
        company: 'Tesla',
        expertise: ['Machine Learning', 'Python', 'Deep Learning'],
        rating: 4.9,
        hourlyRate: 160,
        available: true,
        responseTime: '< 2 hours',
        image: '/avatars/priya.jpg',
      },
    ],
  };

  const handleFindMentors = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const normalizedTitle = targetJobTitle.toLowerCase();
      let foundMentors: Mentor[] = [];

      // Try exact match first
      if (mockMentors[normalizedTitle]) {
        foundMentors = mockMentors[normalizedTitle];
      } else {
        // Try partial match
        const keys = Object.keys(mockMentors);
        const matchedKey = keys.find((key) => normalizedTitle.includes(key));
        if (matchedKey) {
          foundMentors = mockMentors[matchedKey] || [];
        } else {
          // Default to software engineer mentors
          foundMentors = mockMentors['software engineer'] || [];
        }
      }

      setMentors(foundMentors);
      setIsLoading(false);
    }, 1000);
  };

  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    onMentorSelect(mentor);
  };

  // Auto-trigger search when targetJobTitle changes
  React.useEffect(() => {
    if (targetJobTitle) {
      handleFindMentors();
    }
  }, [targetJobTitle, handleFindMentors]);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-4 font-bold text-lg">Mentor Matching</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-blue-500 border-b-2" />
          <span className="ml-2">Finding mentors for {targetJobTitle}...</span>
        </div>
      ) : mentors.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            We found {mentors.length} mentor{mentors.length !== 1 ? 's' : ''} who can help you
            optimize your resume for {targetJobTitle} roles:
          </p>

          <div className="space-y-3">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedMentor?.id === mentor.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectMentor(mentor)}
              >
                <div className="flex items-start">
                  {mentor.image ? (
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="mr-3 h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                      <span className="font-bold text-gray-700">
                        {mentor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{mentor.name}</h4>
                        <p className="text-gray-600 text-sm">
                          {mentor.title} at {mentor.company}
                        </p>
                      </div>
                      <div className="flex items-center rounded bg-yellow-100 px-2 py-1">
                        <span className="font-medium text-sm text-yellow-800">
                          ★ {mentor.rating}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="rounded bg-blue-100 px-2 py-1 text-blue-800 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-gray-600 text-sm">
                        {mentor.available ? (
                          <span className="text-green-600">
                            Available • Responds {mentor.responseTime}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            Away • Responds in {mentor.responseTime}
                          </span>
                        )}
                      </span>
                      <span className="font-semibold">${mentor.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedMentor && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-green-800">
                <span className="font-semibold">Selected mentor:</span> {selectedMentor.name}
                {selectedMentor.available
                  ? ' is available for a session'
                  : ' will be notified of your request'}
              </p>
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={() => {
                  // In a real implementation, this would initiate a chat or scheduling session
                  alert(`Connecting you with ${selectedMentor.name}...`);
                }}
              >
                Connect with Mentor
              </button>
            </div>
          )}
        </div>
      ) : targetJobTitle ? (
        <div className="py-4 text-center">
          <p className="text-gray-500">
            No mentors currently available for "{targetJobTitle}" roles. Try adjusting your job
            title or check back later.
          </p>
          <button className="btn btn-outline mt-2" onClick={handleFindMentors}>
            Try Again
          </button>
        </div>
      ) : (
        <p className="py-4 text-center text-gray-500">
          Enter a target job title to find relevant mentors.
        </p>
      )}
    </div>
  );
};

export default MentorMatching;
