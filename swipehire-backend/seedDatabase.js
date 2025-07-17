import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.mjs';
import { Job } from './models/Job.js';

// Load environment variables
dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/swipehire';

const sampleUsers = [
  {
    name: 'TechCorp Recruiter',
    email: 'recruiter@techcorp.com',
    firebaseUid: 'recruiter123',
    selectedRole: 'recruiter',
    companyName: 'TechCorp Solutions',
    companyIndustry: 'Technology',
    companyDescription: 'Leading technology solutions provider specializing in innovative software development and digital transformation.',
    companyLogoUrl: 'https://placehold.co/150x150/4F46E5/FFFFFF?text=TechCorp',
    companyProfileComplete: true,
    jobOpenings: [
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
        location: 'San Francisco, CA',
        salaryRange: '$120,000 - $180,000',
        jobType: 'Full-time',
        tags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
        requiredExperienceLevel: 'Senior',
        requiredEducationLevel: 'Bachelor\'s',
        workLocationType: 'Hybrid',
        salaryMin: 120000,
        salaryMax: 180000,
        companyCultureKeywords: ['Innovation', 'Collaboration', 'Growth', 'Work-life balance'],
        companyNameForJob: 'TechCorp Solutions'
      },
      {
        title: 'Product Manager',
        description: 'Seeking a strategic Product Manager to drive product vision and roadmap. You will work closely with engineering, design, and business teams.',
        location: 'Remote',
        salaryRange: '$100,000 - $150,000',
        jobType: 'Full-time',
        tags: ['Product Strategy', 'Agile', 'Roadmap', 'Stakeholder Management'],
        requiredExperienceLevel: 'Mid-level',
        requiredEducationLevel: 'Bachelor\'s',
        workLocationType: 'Remote',
        salaryMin: 100000,
        salaryMax: 150000,
        companyCultureKeywords: ['Innovation', 'User-focused', 'Data-driven'],
        companyNameForJob: 'TechCorp Solutions'
      }
    ]
  },
  {
    name: 'StartupX HR',
    email: 'hr@startupx.com',
    firebaseUid: 'recruiter456',
    selectedRole: 'recruiter',
    companyName: 'StartupX Innovations',
    companyIndustry: 'Startup',
    companyDescription: 'Fast-growing startup revolutionizing the tech industry with cutting-edge solutions and agile development practices.',
    companyLogoUrl: 'https://placehold.co/150x150/10B981/FFFFFF?text=StartupX',
    companyProfileComplete: true,
    jobOpenings: [
      {
        title: 'Frontend Developer',
        description: 'Join our innovative team to build beautiful and responsive user interfaces. Work with the latest technologies in a fast-paced environment.',
        location: 'Austin, TX',
        salaryRange: '$80,000 - $120,000',
        jobType: 'Full-time',
        tags: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
        requiredExperienceLevel: 'Mid-level',
        requiredEducationLevel: 'Bachelor\'s',
        workLocationType: 'Hybrid',
        salaryMin: 80000,
        salaryMax: 120000,
        companyCultureKeywords: ['Innovation', 'Fast-paced', 'Learning', 'Equity'],
        companyNameForJob: 'StartupX Innovations'
      }
    ]
  },
  {
    name: 'HealthCare Pro',
    email: 'jobs@healthcarepro.com',
    firebaseUid: 'recruiter789',
    selectedRole: 'recruiter',
    companyName: 'Healthcare Pro Solutions',
    companyIndustry: 'Healthcare',
    companyDescription: 'Leading healthcare technology company providing innovative solutions for patient care and medical practice management.',
    companyLogoUrl: 'https://placehold.co/150x150/EF4444/FFFFFF?text=HealthPro',
    companyProfileComplete: true,
    jobOpenings: [
      {
        title: 'Healthcare Data Analyst',
        description: 'Analyze healthcare data to improve patient outcomes and operational efficiency. Strong analytical skills and healthcare domain knowledge required.',
        location: 'Boston, MA',
        salaryRange: '$90,000 - $130,000',
        jobType: 'Full-time',
        tags: ['Data Analysis', 'Healthcare', 'SQL', 'Python', 'Tableau'],
        requiredExperienceLevel: 'Mid-level',
        requiredEducationLevel: 'Bachelor\'s',
        workLocationType: 'On-site',
        salaryMin: 90000,
        salaryMax: 130000,
        companyCultureKeywords: ['Healthcare', 'Impact', 'Collaboration', 'Growth'],
        companyNameForJob: 'Healthcare Pro Solutions'
      }
    ]
  }
];

const sampleJobs = [
  {
    userId: null, // Will be populated after user creation
    title: 'Software Engineer - AI/ML',
    description: 'Join our AI team to develop cutting-edge machine learning solutions. You will work on natural language processing, computer vision, and predictive analytics projects.',
    location: 'Palo Alto, CA',
    salaryRange: '$130,000 - $200,000',
    jobType: 'Full-time',
    skillsRequired: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP'],
    mediaUrl: 'https://placehold.co/400x200/8B5CF6/FFFFFF?text=AI-ML-Engineer',
    isPublic: true
  },
  {
    userId: null,
    title: 'UX/UI Designer',
    description: 'Create exceptional user experiences for our digital products. Collaborate with product managers and engineers to design intuitive interfaces and seamless user flows.',
    location: 'New York, NY',
    salaryRange: '$90,000 - $140,000',
    jobType: 'Full-time',
    skillsRequired: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
    mediaUrl: 'https://placehold.co/400x200/EC4899/FFFFFF?text=UX-UI-Designer',
    isPublic: true
  },
  {
    userId: null,
    title: 'DevOps Engineer',
    description: 'Manage cloud infrastructure, CI/CD pipelines, and deployment automation. Ensure high availability and scalability of our applications.',
    location: 'Seattle, WA',
    salaryRange: '$110,000 - $160,000',
    jobType: 'Full-time',
    skillsRequired: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    mediaUrl: 'https://placehold.co/400x200/06B6D4/FFFFFF?text=DevOps-Engineer',
    isPublic: true
  },
  {
    userId: null,
    title: 'Data Scientist',
    description: 'Analyze large datasets to extract meaningful insights and build predictive models. Work closely with business stakeholders to drive data-driven decisions.',
    location: 'Chicago, IL',
    salaryRange: '$120,000 - $180,000',
    jobType: 'Full-time',
    skillsRequired: ['Python', 'R', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'],
    mediaUrl: 'https://placehold.co/400x200/84CC16/FFFFFF?text=Data-Scientist',
    isPublic: true
  },
  {
    userId: null,
    title: 'Mobile App Developer',
    description: 'Develop cross-platform mobile applications using React Native or Flutter. Create engaging mobile experiences for iOS and Android platforms.',
    location: 'Los Angeles, CA',
    salaryRange: '$100,000 - $150,000',
    jobType: 'Full-time',
    skillsRequired: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
    mediaUrl: 'https://placehold.co/400x200/F59E0B/FFFFFF?text=Mobile-Developer',
    isPublic: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create jobs
    const jobsToCreate = sampleJobs.map((job, index) => ({
      ...job,
      userId: createdUsers[index % createdUsers.length]._id
    }));

    const createdJobs = await Job.insertMany(jobsToCreate);
    console.log(`✅ Created ${createdJobs.length} jobs`);

    console.log('✅ Database seeding completed successfully!');
    console.log(`🔗 MongoDB URI: ${mongoUri}`);
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`- Users created: ${createdUsers.length}`);
    console.log(`- Jobs created: ${createdJobs.length}`);
    
    // List created users
    console.log('\n👥 Created Users:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.companyName || 'No company'}`);
    });

    // List created jobs
    console.log('\n💼 Created Jobs:');
    createdJobs.forEach(job => {
      console.log(`- ${job.title} at ${job.location}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedDatabase();