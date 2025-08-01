// src/app/company/[companyId]/page.tsx
'use client';

import { Briefcase, Building2, ExternalLink, Info, Loader2, Users } from 'lucide-react'; // Added Star
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCompanies } from '@/lib/mockData';
import type { Company, CompanyReview, CompanyJobOpening as JobOpening } from '@/lib/types';

// Conceptual: This page would fetch company data based on companyId

interface ReviewSummary {
  averageResponsiveness: number;
  averageAttitude: number;
  averageProcessExperience: number;
  totalReviews: number;
}

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params?.['companyId'] as string; // This is the mock ID like 'comp1' or slug from URL
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_reviews, _setReviews] = useState<CompanyReview[]>([]);
  const [_reviewSummary, _setReviewSummary] = useState<ReviewSummary | null>(null);
  const [_isLoadingReviews, _setIsLoadingReviews] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const mockCompany =
      mockCompanies.find((c) => c.id === companyId) ||
      mockCompanies.find(
        (c) => c.name.toLowerCase().replace(/\s+/g, '-') === companyId.toLowerCase()
      ) ||
      mockCompanies[0];

    if (mockCompany) {
      setTimeout(() => {
        setCompanyData(mockCompany);
        setIsLoading(false);
        // Conceptual: Fetch reviews if companyData.recruiterUserId (as company owner's User ID) exists
        // if (mockCompany.recruiterUserId) {
        //   setIsLoadingReviews(true);
        //   Promise.all([
        //     getCompanyReviews(mockCompany.recruiterUserId),
        //     getCompanyReviewSummary(mockCompany.recruiterUserId)
        //   ]).then(([fetchedReviews, summary]) => {
        //     setReviews(fetchedReviews);
        //     setReviewSummary(summary);
        //   }).catch(err => {
        //     console.error("Failed to load reviews for company:", mockCompany.name, err);
        //     // Potentially show a toast
        //   }).finally(() => setIsLoadingReviews(false));
        // }
      }, 1000);
    } else {
      setTimeout(() => {
        setCompanyData(null);
        setIsLoading(false);
      }, 1000);
    }
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <Building2 className="mb-4 h-16 w-16 text-destructive" />
        <h1 className="font-bold text-2xl text-destructive">Company Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The company profile you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => window.history.back()} className="mt-6">
          Go Back
        </Button>
      </div>
    );
  }

  const {
    name,
    industry,
    description,
    cultureHighlights,
    logoUrl,
    introVideoUrl,
    jobOpenings,
    companyNeeds,
  } = companyData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full max-w-4xl overflow-hidden shadow-2xl">
          <CardHeader className="relative p-0">
            <div className="flex h-48 items-center justify-center bg-gradient-to-r from-primary to-purple-600 md:h-64">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${name} Logo`}
                  width={120}
                  height={120}
                  className="rounded-lg border-4 border-white bg-white object-contain p-1 shadow-xl"
                  data-ai-hint="company logo"
                />
              ) : (
                <Building2 className="h-24 w-24 text-white/80" />
              )}
            </div>
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <CardTitle className="font-bold text-3xl text-white md:text-4xl">{name}</CardTitle>
              <CardDescription className="mt-1 text-lg text-purple-200">{industry}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-6">
            <section>
              <h2 className="mb-3 flex items-center font-semibold text-primary text-xl">
                <Info className="mr-2 h-5 w-5" /> About {name}
              </h2>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {description || 'No company description provided.'}
              </p>
              {companyNeeds && (
                <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-700 text-sm">
                  <span className="font-semibold">Currently Focusing On:</span> {companyNeeds}
                </div>
              )}
            </section>

            {introVideoUrl && (
              <section>
                <h2 className="mb-3 flex items-center font-semibold text-primary text-xl">
                  <Briefcase className="mr-2 h-5 w-5" /> Company Introduction Video
                </h2>
                <div className="aspect-video overflow-hidden rounded-lg shadow-md">
                  <video
                    src={introVideoUrl}
                    controls
                    className="h-full w-full object-cover"
                    data-ai-hint="company intro video"
                  >
                    <track kind="captions" />
                  </video>
                </div>
              </section>
            )}

            {cultureHighlights && cultureHighlights.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center font-semibold text-primary text-xl">
                  <Users className="mr-2 h-5 w-5" /> Our Culture
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cultureHighlights.map((highlight, index) => (
                    <span
                      key={`culture-${index}-${highlight}`}
                      className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground text-sm shadow-sm"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Conceptual: Placeholder for Reviews Section */}
            {/* {isLoadingReviews && (
              <section className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></section>
            )} */}
            {/* {!isLoadingReviews && reviewSummary && reviews && (
              <section>
                <h2 className="text-xl font-semibold text-primary mb-3 flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" /> Candidate Reviews ({reviewSummary.totalReviews})
                </h2>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">Responsiveness: <StarRatingInput rating={reviewSummary.averageResponsiveness} size={16} disabled /> ({reviewSummary.averageResponsiveness.toFixed(1)})</p>
                  <p className="text-sm">Attitude: <StarRatingInput rating={reviewSummary.averageAttitude} maxRating={3} size={16} disabled /> ({reviewSummary.averageAttitude.toFixed(1)})</p>
                  <p className="text-sm">Process Experience: <StarRatingInput rating={reviewSummary.averageProcessExperience} size={16} disabled /> ({reviewSummary.averageProcessExperience.toFixed(1)})</p>
                </div>
                <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                  {reviews.map(review => (
                    <div key={review._id} className="p-3 border rounded-md text-sm">
                      <p className="font-semibold">{review.isAnonymous ? "Anonymous Reviewer" : `Review by User ${review.reviewerUserId.slice(-4)}`}</p>
                      <p className="text-muted-foreground mt-1">{review.comments}</p>
                    </div>
                  ))}
                </div>
              </section>
            )} */}

            {jobOpenings && jobOpenings.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center font-semibold text-primary text-xl">
                  <Briefcase className="mr-2 h-5 w-5" /> Current Openings ({jobOpenings.length})
                </h2>
                <div className="space-y-3">
                  {jobOpenings.slice(0, 3).map((job: JobOpening) => {
                    const jobPostingJsonLd = {
                      '@context': 'https://schema.org',
                      '@type': 'JobPosting',
                      title: job.title,
                      description: job.description,
                      identifier: {
                        '@type': 'PropertyValue',
                        name: 'SwipeHire Job ID',
                        value: job._id,
                      },
                      datePosted: job.datePosted
                        ? new Date(job.datePosted).toISOString().split('T')[0]
                        : undefined,
                      validThrough: job.validThrough
                        ? new Date(job.validThrough).toISOString().split('T')[0]
                        : undefined,
                      employmentType: job.jobType
                        ? job.jobType.replace(/_/g, ' ').toUpperCase()
                        : 'FULL_TIME',
                      hiringOrganization: {
                        '@type': 'Organization',
                        name: companyData.name,
                        sameAs: companyData.websiteUrl,
                        logo: companyData.logoUrl,
                      },
                      jobLocation: {
                        '@type': 'Place',
                        address: {
                          '@type': 'PostalAddress',
                          streetAddress: job.location,
                          addressLocality: job.location?.split(',')[0],
                          addressRegion: job.location?.split(',')[1],
                          addressCountry: 'US', // Assuming US, this should be dynamic
                        },
                      },
                      baseSalary: {
                        '@type': 'MonetaryAmount',
                        currency: 'USD', // Assuming USD
                        value: {
                          '@type': 'QuantitativeValue',
                          minValue: job.salaryMin,
                          maxValue: job.salaryMax,
                          unitText: 'YEAR',
                        },
                      },
                    };

                    return (
                      <div
                        key={job._id || job.title}
                        className="rounded-md border p-3 transition-shadow hover:shadow-md"
                      >
                        <Script
                          id={`job-posting-schema-${job._id}`}
                          type="application/ld+json"
                          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
                        />
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <p className="text-muted-foreground text-xs">
                          {job.location || 'Not specified'} - {job.jobType || 'Not specified'}
                        </p>
                        <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-primary">
                          View Details (Conceptual)
                        </Button>
                      </div>
                    );
                  })}
                  {jobOpenings.length > 3 && (
                    <p className="text-muted-foreground text-sm">
                      And {jobOpenings.length - 3} more...
                    </p>
                  )}
                </div>
              </section>
            )}

            <section className="border-t pt-6 text-center">
              <h3 className="mb-2 font-semibold text-lg text-muted-foreground">
                Interested in {name}?
              </h3>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <ExternalLink className="mr-2 h-5 w-5" /> Visit Company Website (Conceptual)
              </Button>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
