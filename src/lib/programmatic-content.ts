// Configuration for programmatic page generation
export interface ProgrammaticPageConfig {
  skills: string[];
  locations: string[];
  jobTypes: string[];
}

// Skills database with metadata
export const techSkills = [
  { name: 'React', category: 'Frontend', demand: 'High', averageSalary: 95000 },
  { name: 'Python', category: 'Backend', demand: 'High', averageSalary: 100000 },
  { name: 'JavaScript', category: 'Full Stack', demand: 'High', averageSalary: 85000 },
  { name: 'Node.js', category: 'Backend', demand: 'High', averageSalary: 90000 },
  { name: 'TypeScript', category: 'Full Stack', demand: 'High', averageSalary: 98000 },
  { name: 'Java', category: 'Backend', demand: 'High', averageSalary: 102000 },
  { name: 'Go', category: 'Backend', demand: 'Medium', averageSalary: 105000 },
  { name: 'Rust', category: 'Systems', demand: 'Medium', averageSalary: 115000 },
  { name: 'Swift', category: 'Mobile', demand: 'Medium', averageSalary: 110000 },
  { name: 'Kotlin', category: 'Mobile', demand: 'Medium', averageSalary: 95000 },
  { name: 'Vue.js', category: 'Frontend', demand: 'Medium', averageSalary: 88000 },
  { name: 'Angular', category: 'Frontend', demand: 'Medium', averageSalary: 92000 },
  { name: 'Django', category: 'Backend', demand: 'Medium', averageSalary: 96000 },
  { name: 'Flask', category: 'Backend', demand: 'Medium', averageSalary: 88000 },
  { name: 'Express.js', category: 'Backend', demand: 'Medium', averageSalary: 85000 },
  { name: 'Docker', category: 'DevOps', demand: 'High', averageSalary: 105000 },
  { name: 'Kubernetes', category: 'DevOps', demand: 'High', averageSalary: 120000 },
  { name: 'AWS', category: 'Cloud', demand: 'High', averageSalary: 110000 },
  { name: 'Azure', category: 'Cloud', demand: 'High', averageSalary: 108000 },
  { name: 'GCP', category: 'Cloud', demand: 'Medium', averageSalary: 112000 },
  { name: 'PostgreSQL', category: 'Database', demand: 'High', averageSalary: 95000 },
  { name: 'MongoDB', category: 'Database', demand: 'High', averageSalary: 90000 },
  { name: 'Redis', category: 'Database', demand: 'Medium', averageSalary: 100000 },
  { name: 'GraphQL', category: 'API', demand: 'Medium', averageSalary: 105000 },
  { name: 'TensorFlow', category: 'AI/ML', demand: 'High', averageSalary: 125000 },
  { name: 'PyTorch', category: 'AI/ML', demand: 'High', averageSalary: 128000 },
];

// Location database with metadata
export const locations = [
  {
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    jobCount: 1250,
    averageSalary: 145000,
    costOfLiving: 'High',
    topCompanies: ['Google', 'Meta', 'Uber', 'Airbnb', 'Stripe'],
    techScene: 'Silicon Valley hub with highest salaries and most startups',
  },
  {
    city: 'New York',
    state: 'NY',
    country: 'US',
    jobCount: 980,
    averageSalary: 125000,
    costOfLiving: 'High',
    topCompanies: ['Goldman Sachs', 'JPMorgan', 'Bloomberg', 'Spotify', 'MongoDB'],
    techScene: 'Fintech capital with diverse tech opportunities',
  },
  {
    city: 'Seattle',
    state: 'WA',
    country: 'US',
    jobCount: 875,
    averageSalary: 130000,
    costOfLiving: 'High',
    topCompanies: ['Amazon', 'Microsoft', 'Meta', 'Google', 'Zillow'],
    techScene: 'Cloud computing and e-commerce innovation center',
  },
  {
    city: 'Austin',
    state: 'TX',
    country: 'US',
    jobCount: 654,
    averageSalary: 110000,
    costOfLiving: 'Medium',
    topCompanies: ['Dell', 'IBM', 'Oracle', 'Indeed', 'RetailMeNot'],
    techScene: 'Rapidly growing tech scene with lower cost of living',
  },
  {
    city: 'Boston',
    state: 'MA',
    country: 'US',
    jobCount: 543,
    averageSalary: 115000,
    costOfLiving: 'High',
    topCompanies: ['HubSpot', 'Wayfair', 'DraftKings', 'Zipcar', 'Toast'],
    techScene: 'Biotech and fintech hub with strong university connections',
  },
  {
    city: 'Remote',
    state: '',
    country: 'US',
    jobCount: 2100,
    averageSalary: 105000,
    costOfLiving: 'Variable',
    topCompanies: ['GitLab', 'Zapier', 'Automattic', 'Buffer', 'InVision'],
    techScene: 'Flexible work-from-anywhere opportunities across all industries',
  },
];

// Job types with search volume
export const jobTypes = [
  { name: 'Software Engineer', searchVolume: 45000, category: 'Engineering' },
  { name: 'Frontend Developer', searchVolume: 22000, category: 'Engineering' },
  { name: 'Backend Developer', searchVolume: 18000, category: 'Engineering' },
  { name: 'Full Stack Developer', searchVolume: 35000, category: 'Engineering' },
  { name: 'Data Scientist', searchVolume: 28000, category: 'Data' },
  { name: 'DevOps Engineer', searchVolume: 15000, category: 'Infrastructure' },
  { name: 'Mobile Developer', searchVolume: 12000, category: 'Engineering' },
  { name: 'QA Engineer', searchVolume: 8000, category: 'Quality' },
  { name: 'Product Manager', searchVolume: 25000, category: 'Product' },
  { name: 'UI/UX Designer', searchVolume: 20000, category: 'Design' },
];

// Generate programmatic page data
export const generateSkillLocationPage = (skill: string, location: string) => {
  const skillData = techSkills.find((s) => s.name.toLowerCase() === skill.toLowerCase());
  const locationData = locations.find(
    (l) =>
      l.city.toLowerCase() === location.toLowerCase() ||
      (location.toLowerCase() === 'remote' && l.city === 'Remote')
  );

  if (!skillData || !locationData) return null;

  const adjustedSalary =
    locationData.city === 'Remote'
      ? skillData.averageSalary
      : Math.round(skillData.averageSalary * (locationData.averageSalary / 100000));

  return {
    skill: skillData.name,
    location:
      locationData.city === 'Remote' ? 'Remote' : `${locationData.city}, ${locationData.state}`,
    jobCount: Math.floor(locationData.jobCount * (skillData.demand === 'High' ? 0.25 : 0.15)),
    averageSalary: adjustedSalary,
    skillCategory: skillData.category,
    topCompanies: locationData.topCompanies.slice(0, 3),
    demandLevel: skillData.demand,
    costOfLiving: locationData.costOfLiving,
    techScene: locationData.techScene,
    slug: `${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}-jobs-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    metaTitle: `${skillData.name} Jobs in ${locationData.city === 'Remote' ? 'Remote' : `${locationData.city}, ${locationData.state}`} - ${adjustedSalary.toLocaleString()} Average Salary | SwipeHire`,
    metaDescription: `Find ${skillData.name} jobs in ${locationData.city === 'Remote' ? 'remote positions' : `${locationData.city}, ${locationData.state}`}. Average salary: $${adjustedSalary.toLocaleString()}. ${locationData.jobCount}+ opportunities available. Apply now on SwipeHire.`,
    keywords: [
      `${skillData.name.toLowerCase()} jobs`,
      `${skillData.name.toLowerCase()} developer`,
      `${locationData.city.toLowerCase()} tech jobs`,
      `${skillData.name.toLowerCase()} ${locationData.city.toLowerCase()}`,
      `${skillData.category.toLowerCase()} jobs`,
      'software engineer',
      'tech careers',
      locationData.city === 'Remote' ? 'remote work' : `${locationData.city.toLowerCase()} jobs`,
    ],
  };
};

export const generateSkillJobTypePage = (skill: string, jobType: string) => {
  const skillData = techSkills.find((s) => s.name.toLowerCase() === skill.toLowerCase());
  const jobTypeData = jobTypes.find((jt) => jt.name.toLowerCase() === jobType.toLowerCase());

  if (!skillData || !jobTypeData) return null;

  const combinedSearchVolume = Math.floor(jobTypeData.searchVolume * 0.3); // Estimate for skill+jobtype combo
  const jobCount = Math.floor(combinedSearchVolume / 10); // Rough estimate

  return {
    skill: skillData.name,
    jobType: jobTypeData.name,
    jobCount,
    averageSalary: skillData.averageSalary,
    searchVolume: combinedSearchVolume,
    category: jobTypeData.category,
    skillCategory: skillData.category,
    demandLevel: skillData.demand,
    slug: `${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${jobType.toLowerCase().replace(/[^a-z0-9]/g, '-')}-jobs`,
    metaTitle: `${skillData.name} ${jobTypeData.name} Jobs - $${skillData.averageSalary.toLocaleString()} Average Salary | SwipeHire`,
    metaDescription: `Find ${skillData.name} ${jobTypeData.name} positions. Average salary: $${skillData.averageSalary.toLocaleString()}. ${jobCount}+ opportunities available. Apply to top companies on SwipeHire.`,
    keywords: [
      `${skillData.name.toLowerCase()} ${jobTypeData.name.toLowerCase()}`,
      `${skillData.name.toLowerCase()} developer jobs`,
      `${jobTypeData.name.toLowerCase()} ${skillData.name.toLowerCase()}`,
      `${skillData.category.toLowerCase()} ${jobTypeData.name.toLowerCase()}`,
      'tech jobs',
      'software development',
      'programming careers',
    ],
  };
};

// Generate all possible combinations
export const generateAllSkillLocationCombinations = () => {
  const combinations = [];

  for (const skill of techSkills.slice(0, 15)) {
    // Limit to top 15 skills
    for (const location of locations) {
      const pageData = generateSkillLocationPage(skill.name, location.city);
      if (pageData) {
        combinations.push(pageData);
      }
    }
  }

  return combinations;
};

export const generateAllSkillJobTypeCombinations = () => {
  const combinations = [];

  for (const skill of techSkills.slice(0, 10)) {
    // Limit to top 10 skills
    for (const jobType of jobTypes.slice(0, 6)) {
      // Limit to top 6 job types
      const pageData = generateSkillJobTypePage(skill.name, jobType.name);
      if (pageData) {
        combinations.push(pageData);
      }
    }
  }

  return combinations;
};

// Utility to get related skills
export const getRelatedSkills = (currentSkill: string, limit = 5) => {
  const currentSkillData = techSkills.find(
    (s) => s.name.toLowerCase() === currentSkill.toLowerCase()
  );
  if (!currentSkillData) return [];

  return techSkills
    .filter(
      (skill) =>
        skill.name !== currentSkillData.name && skill.category === currentSkillData.category
    )
    .slice(0, limit);
};

// Utility to get related locations
export const getRelatedLocations = (currentLocation: string, limit = 4) => {
  const currentLocationData = locations.find(
    (l) => l.city.toLowerCase() === currentLocation.toLowerCase()
  );
  if (!currentLocationData) return [];

  return locations
    .filter((location) => location.city !== currentLocationData.city)
    .sort(
      (a, b) =>
        Math.abs(a.averageSalary - currentLocationData.averageSalary) -
        Math.abs(b.averageSalary - currentLocationData.averageSalary)
    )
    .slice(0, limit);
};
