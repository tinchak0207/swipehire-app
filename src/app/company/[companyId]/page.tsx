
// src/app/company/[companyId]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Building2, MapPin, Globe, Users, Info, Briefcase, ExternalLink, Loader2, Star } from 'lucide-react'; // Added Star
import type { Company, CompanyJobOpening, CompanyReview } from '@/lib/types'; 
import { mockCompanies } from '@/lib/mockData'; 
import { getCompanyReviews, getCompanyReviewSummary } from '@/services/reviewService'; // Added review services
import { StarRatingInput } from '@/components/reviews/StarRatingInput'; // To display stars

// Conceptual: This page would fetch company data based on companyId

interface ReviewSummary {
  averageResponsiveness: number;
  averageAttitude: number;
  averageProcessExperience: number;
  totalReviews: number;
}

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.companyId as string; // This is the mock ID like 'comp1' or slug from URL
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const mockCompany = mockCompanies.find(c => c.id === companyId) || 
                        mockCompanies.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === companyId.toLowerCase()) ||
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
        <Building2 className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Company Not Found</h1>
        <p className="text-muted-foreground mt-2">The company profile you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => window.history.back()} className="mt-6">Go Back</Button>
      </div>
    );
  }
  
  const { name, industry, description, cultureHighlights, logoUrl, introVideoUrl, jobOpenings, companyNeeds } = companyData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-4xl mx-auto shadow-2xl overflow-hidden">
          <CardHeader className="p-0 relative">
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
              {logoUrl ? (
                 <Image 
                    src={logoUrl} 
                    alt={`${name} Logo`} 
                    width={120} 
                    height={120} 
                    className="rounded-lg shadow-xl border-4 border-white object-contain bg-white p-1" 
                    data-ai-hint="company logo"
                />
              ) : (
                <Building2 className="h-24 w-24 text-white/80" />
              )}
            </div>
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <CardTitle className="text-3xl md:text-4xl font-bold text-white">{name}</CardTitle>
                <CardDescription className="text-lg text-purple-200 mt-1">{industry}</CardDescription>
             </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-primary mb-3 flex items-center">
                <Info className="mr-2 h-5 w-5" /> About {name}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {description || "No company description provided."}
              </p>
              {companyNeeds && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                    <span className="font-semibold">Currently Focusing On:</span> {companyNeeds}
                </div>
              )}
            </section>

            {introVideoUrl && (
              <section>
                <h2 className="text-xl font-semibold text-primary mb-3 flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" /> Company Introduction Video
                </h2>
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                  <video src={introVideoUrl} controls className="w-full h-full object-cover" data-ai-hint="company intro video"></video>
                </div>
              </section>
            )}

            {cultureHighlights && cultureHighlights.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-primary mb-3 flex items-center">
                  <Users className="mr-2 h-5 w-5" /> Our Culture
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cultureHighlights.map((highlight, index) => (
                    <span key={index} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm shadow-sm">
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
                <h2 className="text-xl font-semibold text-primary mb-3 flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" /> Current Openings ({jobOpenings.length})
                </h2>
                <div className="space-y-3">
                    {jobOpenings.slice(0,3).map(job => (
                         <div key={job._id || job.title} className="p-3 border rounded-md hover:shadow-md transition-shadow">
                            <h3 className="font-semibold text-foreground">{job.title}</h3>
                            <p className="text-xs text-muted-foreground">{job.location || 'Not specified'} - {job.jobType || 'Not specified'}</p>
                            <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">View Details (Conceptual)</Button>
                         </div>
                    ))}
                    {jobOpenings.length > 3 && <p className="text-sm text-muted-foreground">And {jobOpenings.length -3} more...</p>}
                </div>
              </section>
            )}

            <section className="text-center pt-6 border-t">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Interested in {name}?</h3>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <ExternalLink className="mr-2 h-5 w-5" /> Visit Company Website (Conceptual)
                </Button>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

