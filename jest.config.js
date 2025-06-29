const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/components/__tests__/SalaryVisualizationChart.test.tsx',
    '<rootDir>/src/components/resume-optimizer/TargetJobInputForm.test.tsx',
    '<rootDir>/src/components/resume-optimizer/ReportDisplay.integration.test.tsx',
    '<rootDir>/src/components/__tests__/ReportDownloadButton.test.tsx',
    '<rootDir>/src/components/__tests__/SalaryQueryForm.test.tsx',
    '<rootDir>/src/app/salary-enquiry/__tests__/integration.test.tsx',
    '<rootDir>/src/app/salary-enquiry/__tests__/page.test.tsx',
    '<rootDir>/src/components/__tests__/SalaryDataTable.test.tsx',
    '<rootDir>/unit_test/career-ai/CareerDashboard.test.tsx',
    '<rootDir>/unit_test/career-ai/CareerAIPage.test.tsx',
    '<rootDir>/unit_test/career-ai/FormsAppSurvey.test.tsx',
    '<rootDir>/src/hooks/__tests__/useSalaryQuery.test.ts',
    '<rootDir>/src/lib/testing/accessibility.test.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
