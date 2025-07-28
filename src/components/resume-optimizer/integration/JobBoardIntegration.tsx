import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Filter,
  MapPin,
  Search,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  posted: string;
  description: string;
  requirements: string[];
  isApplied?: boolean;
}

interface JobBoardIntegrationProps {
  userProfile: {
    skills: string[];
    experience: any[];
    targetJob?: string;
  };
  onJobApply?: (jobId: string) => void;
}

export const JobBoardIntegration: React.FC<JobBoardIntegrationProps> = ({
  userProfile,
  onJobApply,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Mock job data - in a real implementation, this would come from an API
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$120,000 - $150,000',
        type: 'Full-time',
        posted: '2 days ago',
        description:
          'We are looking for a Senior Frontend Developer to join our team. You will be responsible for building user-facing features using React, TypeScript, and modern web technologies.',
        requirements: [
          '5+ years React experience',
          'TypeScript proficiency',
          'State management (Redux/Zustand)',
        ],
      },
      {
        id: '2',
        title: 'Product Manager',
        company: 'InnovateCo',
        location: 'Remote',
        salary: '$110,000 - $140,000',
        type: 'Full-time',
        posted: '1 week ago',
        description:
          'Join our product team to drive the development of our flagship SaaS platform. You will work closely with engineering, design, and customer success teams.',
        requirements: [
          '3+ years product management experience',
          'SaaS experience',
          'Agile methodology',
        ],
      },
      {
        id: '3',
        title: 'UX Designer',
        company: 'Creative Solutions',
        location: 'New York, NY',
        salary: '$90,000 - $120,000',
        type: 'Full-time',
        posted: '3 days ago',
        description:
          'Design beautiful and intuitive user experiences for our enterprise software platform. Collaborate with product managers and developers to bring ideas to life.',
        requirements: ['Figma proficiency', 'User research experience', 'Prototyping skills'],
      },
      {
        id: '4',
        title: 'Backend Engineer',
        company: 'DataSystems LLC',
        location: 'Austin, TX',
        salary: '$130,000 - $160,000',
        type: 'Full-time',
        posted: '5 days ago',
        description:
          'Build scalable backend services and APIs using Node.js and Python. Work with large datasets and implement efficient algorithms.',
        requirements: ['Node.js/Python experience', 'Database design', 'Cloud platforms (AWS/GCP)'],
      },
      {
        id: '5',
        title: 'DevOps Specialist',
        company: 'CloudTech',
        location: 'Remote',
        type: 'Contract',
        posted: '1 day ago',
        description:
          'Help us build and maintain our CI/CD pipelines and cloud infrastructure. Work with Kubernetes, Docker, and Terraform.',
        requirements: ['Kubernetes experience', 'Terraform', 'CI/CD pipelines'],
      },
    ];

    setJobs(mockJobs);
    setFilteredJobs(mockJobs);
  }, []);

  // Filter jobs based on search criteria
  useEffect(() => {
    let result = jobs;

    if (searchTerm) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      result = result.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter based on user skills if available
    if (userProfile.skills && userProfile.skills.length > 0) {
      result = result
        .map((job) => {
          const matchCount = job.requirements.filter((req) =>
            userProfile.skills.some((skill) => req.toLowerCase().includes(skill.toLowerCase()))
          ).length;

          return {
            ...job,
            matchScore: matchCount / job.requirements.length,
          };
        })
        .sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0)) as unknown as Job[];
    }

    setFilteredJobs(result);
  }, [searchTerm, locationFilter, jobs, userProfile.skills]);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Jobs Updated',
        description: `Found ${filteredJobs.length} jobs matching your criteria.`,
      });
    }, 800);
  };

  const handleApply = (jobId: string) => {
    // In a real implementation, this would call an API to apply to the job
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob({ ...job, isApplied: true });
      setJobs(jobs.map((j) => (j.id === jobId ? { ...j, isApplied: true } : j)));
      onJobApply?.(jobId);

      toast({
        title: 'Application Submitted',
        description: `Your application for ${job.title} at ${job.company} has been submitted successfully!`,
      });
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Board Integration
        </CardTitle>
        <CardDescription>
          Search and apply to jobs that match your skills and experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="job-search">Job Title or Keyword</Label>
            <div className="relative">
              <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="job-search"
                placeholder="Search jobs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="City, state, or remote"
                className="pl-10"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full" disabled={loading}>
              <Filter className="mr-2 h-4 w-4" />
              {loading ? 'Searching...' : 'Filter Jobs'}
            </Button>
          </div>
        </div>

        {/* Job Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
            </h3>
            {userProfile.targetJob && (
              <Badge variant="secondary">Target: {userProfile.targetJob}</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleViewJob(job)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-start gap-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        {job.isApplied && <Badge variant="secondary">Applied</Badge>}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                        <MapPin className="ml-2 h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job.id);
                      }}
                      disabled={job.isApplied}
                    >
                      {job.isApplied ? 'Applied' : 'Apply Now'}
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {job.type}
                    </Badge>
                    {job.salary && (
                      <Badge variant="outline">
                        <DollarSign className="mr-1 h-3 w-3" />
                        {job.salary}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Calendar className="mr-1 h-3 w-3" />
                      {job.posted}
                    </Badge>
                  </div>

                  <p className="mt-3 line-clamp-2 text-muted-foreground text-sm">
                    {job.description}
                  </p>

                  {job.requirements.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredJobs.length === 0 && !loading && (
              <div className="py-8 text-center text-muted-foreground">
                <Briefcase className="mx-auto h-12 w-12" />
                <h3 className="mt-4 font-medium">No jobs found</h3>
                <p className="mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Job Detail View */}
        {selectedJob && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl">{selectedJob.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{selectedJob.company}</span>
                    <MapPin className="ml-2 h-4 w-4" />
                    <span>{selectedJob.location}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={selectedJob.isApplied}
                >
                  {selectedJob.isApplied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Applied
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
              </div>

              <div className="my-4 flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  {selectedJob.type}
                </Badge>
                {selectedJob.salary && (
                  <Badge variant="outline">
                    <DollarSign className="mr-1 h-3 w-3" />
                    {selectedJob.salary}
                  </Badge>
                )}
                <Badge variant="outline">
                  <Calendar className="mr-1 h-3 w-3" />
                  {selectedJob.posted}
                </Badge>
              </div>

              <div className="mt-4">
                <h4 className="mb-2 font-semibold">Job Description</h4>
                <p className="text-muted-foreground">{selectedJob.description}</p>
              </div>

              <div className="mt-4">
                <h4 className="mb-2 font-semibold">Requirements</h4>
                <ul className="list-disc space-y-1 pl-5">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Job Posting
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
