import { Building2, DollarSign, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ProgrammaticPageData {
  skill: string;
  location: string;
  jobCount: number;
  averageSalary: number;
  skillCategory: string;
  topCompanies: string[];
  demandLevel: string;
  costOfLiving: string;
  techScene: string;
}

interface SkillLocationPageProps {
  data: ProgrammaticPageData;
  relatedSkills: Array<{ name: string; category: string; averageSalary: number }>;
  relatedLocations: Array<{ city: string; state: string; averageSalary: number }>;
  mockJobs?: Array<{
    id: string;
    title: string;
    company: string;
    salary: string;
    type: string;
    posted: string;
  }>;
}

export const SkillLocationPage: React.FC<SkillLocationPageProps> = ({
  data,
  relatedSkills,
  relatedLocations,
  mockJobs = [],
}) => {
  const demandColor = data.demandLevel === 'High' ? 'text-green-600' : 'text-yellow-600';
  const demandBg = data.demandLevel === 'High' ? 'bg-green-50' : 'bg-yellow-50';
  const salaryRange = {
    min: Math.round(data.averageSalary * 0.8),
    max: Math.round(data.averageSalary * 1.3),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {data.skillCategory}
            </Badge>
            <Badge className={`${demandBg} ${demandColor} border-0`}>
              {data.demandLevel} Demand
            </Badge>
          </div>

          <h1 className="mb-4 font-bold text-4xl text-gray-900 sm:text-5xl">
            {data.skill} Jobs in {data.location}
          </h1>

          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
            Discover {data.jobCount}+ {data.skill} opportunities in {data.location}.
            {data.location === 'Remote'
              ? ' Work from anywhere with top tech companies.'
              : ` ${data.techScene}`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{data.jobCount}+ open positions</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              <span>${data.averageSalary.toLocaleString()} average salary</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>{data.demandLevel} market demand</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Market Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Salary Range</span>
                      <span className="text-sm text-gray-500">
                        ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Job Availability</span>
                      <span className="text-sm text-gray-500">{data.demandLevel}</span>
                    </div>
                    <Progress value={data.demandLevel === 'High' ? 85 : 60} className="h-2" />
                  </div>
                </div>

                {data.location !== 'Remote' && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-900">Cost of Living Impact</h4>
                    <p className="text-blue-800 text-sm">
                      {data.location} has a {data.costOfLiving.toLowerCase()} cost of living. Your $
                      {data.averageSalary.toLocaleString()} salary provides
                      {data.costOfLiving === 'High' ? ' comfortable' : ' excellent'} purchasing
                      power in this market.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Top Companies Hiring {data.skill} Developers
                </CardTitle>
                <CardDescription>
                  Leading employers in {data.location} for {data.skill} professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {data.topCompanies.map((company, index) => (
                    <div key={company} className="flex items-center gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{company}</p>
                        <p className="text-gray-500 text-xs">Multiple openings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mock Job Listings */}
            {mockJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Latest {data.skill} Jobs</CardTitle>
                  <CardDescription>Recent opportunities posted in {data.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-gray-600 text-sm">{job.company}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{job.type}</span>
                          <span>•</span>
                          <span>{job.posted}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{job.salary}</p>
                        <Button size="sm" className="mt-2">
                          View Job
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Open Positions</span>
                  <span className="font-semibold">{data.jobCount}+</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Salary</span>
                  <span className="font-semibold">${data.averageSalary.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Market Demand</span>
                  <Badge variant={data.demandLevel === 'High' ? 'default' : 'secondary'}>
                    {data.demandLevel}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skill Category</span>
                  <span className="text-sm font-medium">{data.skillCategory}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Related Skills</CardTitle>
                <CardDescription>Other in-demand skills in {data.skillCategory}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedSkills.map((skill) => (
                  <Link
                    key={skill.name}
                    href={`/skills/${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-jobs-${data.location.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-500">
                        ${skill.averageSalary.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Related Locations */}
            {data.location !== 'Remote' && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Markets</CardTitle>
                  <CardDescription>Compare {data.skill} salaries in other cities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedLocations.map((location) => (
                    <Link
                      key={`${location.city}-${location.state}`}
                      href={`/skills/${data.skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}-jobs-${location.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{location.city}</span>
                          {location.state && (
                            <span className="text-gray-500">, {location.state}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          ${location.averageSalary.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 font-semibold text-blue-900">Ready to Find Your Next Role?</h3>
                <p className="mb-4 text-blue-800 text-sm">
                  Get personalized {data.skill} job recommendations
                </p>
                <Button asChild className="w-full">
                  <Link href="/jobs">Browse All Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillLocationPage;
