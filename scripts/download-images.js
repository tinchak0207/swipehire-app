const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

// Create directories if they don't exist
const blogDir = path.join(__dirname, '../public/images/blog');
const whitepapersDir = path.join(__dirname, '../public/images/whitepapers');

if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}
if (!fs.existsSync(whitepapersDir)) {
  fs.mkdirSync(whitepapersDir, { recursive: true });
}

// Function to download and optimize image
async function downloadAndOptimizeImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            await sharp(buffer)
              .resize(1200, 800, {
                fit: 'cover',
                position: 'center',
              })
              .jpeg({ quality: 80 })
              .toFile(outputPath);
            console.log(`Processed: ${path.basename(outputPath)}`);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

// Images to download
const images = [
  // AI Recruitment Trends
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    filename: 'ai-recruitment.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
    filename: 'ai-screening.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692',
    filename: 'recruitment-chatbot.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984',
    filename: 'predictive-analytics.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    filename: 'skills-assessment.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692',
    filename: 'bias-reduction.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984',
    filename: 'candidate-experience.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    filename: 'video-interview.jpg',
    category: 'blog',
  },

  // Video Resume Tips
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-main.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-planning.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-setup.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-structure.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-presentation.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-technical.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-mistakes.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-standout.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-best-practices.jpg',
    category: 'blog',
  },

  // Remote Work Guide
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'remote-work-main.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-office.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-productivity.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-communication.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-balance.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-wellbeing.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-development.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-career.jpg',
    category: 'blog',
  },

  // Employer Best Practices
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'employer-best-practices.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'employer-branding.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'candidate-experience.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'interview-process.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'onboarding.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'team-culture.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'diversity-inclusion.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'employee-retention.jpg',
    category: 'blog',
  },

  // Data Privacy
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'data-privacy.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'privacy-regulations.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'data-collection.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'data-storage.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'data-retention.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'vendor-management.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'candidate-rights.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'privacy-training.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'incident-response.jpg',
    category: 'blog',
  },

  // Success Stories
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'success-stories.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'techcorp-success.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'global-solutions.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'startupx-success.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'enterprise-success.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'healthcare-success.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'retail-success.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'education-success.jpg',
    category: 'blog',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'manufacturing-success.jpg',
    category: 'blog',
  },

  // Whitepaper covers
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    filename: 'ai-recruitment-whitepaper.jpg',
    category: 'whitepapers',
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
    filename: 'video-resume-guide.jpg',
    category: 'whitepapers',
  },
  {
    url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094',
    filename: 'remote-work-guide.jpg',
    category: 'whitepapers',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'employer-guide.jpg',
    category: 'whitepapers',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'data-privacy-guide.jpg',
    category: 'whitepapers',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'success-stories.jpg',
    category: 'whitepapers',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    filename: 'implementation-guide.jpg',
    category: 'whitepapers',
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    filename: 'gdpr-checklist.jpg',
    category: 'whitepapers',
  },
];

// Download and process all images
async function processImages() {
  for (const image of images) {
    const outputDir = image.category === 'blog' ? blogDir : whitepapersDir;
    const outputPath = path.join(outputDir, image.filename);

    try {
      await downloadAndOptimizeImage(image.url, outputPath);
    } catch (error) {
      console.error(`Error processing ${image.filename}:`, error.message);
    }
  }
}

processImages()
  .then(() => {
    console.log('All images processed successfully!');
  })
  .catch((error) => {
    console.error('Error processing images:', error);
  });
