export interface CareerOnboardingData {
  educationLevel?: string;
  workExperienceSummary?: string;
  skillsString?: string; // Comma-separated
  interestsString?: string; // Comma-separated, to be split into interestsArray
  valuesString?: string; // Comma-separated, to be split into valuesArray
  initialCareerExpectations?: string;
}

// This is the type that will be passed to onComplete after processing
export interface ProcessedCareerOnboardingData {
  educationLevel?: string;
  workExperienceSummary?: string;
  skillsString?: string;
  interestsArray?: string[];
  valuesArray?: string[];
  initialCareerExpectations?: string;
}
