/**
 * Taskmaster AI Configuration
 *
 * This configuration file defines the rules and guidelines for AI-assisted development
 * in the SwipeHire project. It ensures consistent code quality, architecture patterns,
 * and development practices across the entire codebase.
 */

export interface TaskmasterConfig {
  typescript: TypeScriptRules;
  nextjs: NextJSRules;
  tailwind: TailwindRules;
  daisyui: DaisyUIRules;
  starknet: StarknetRules;
  cairo: CairoRules;
  biome: BiomeRules;
  development: DevelopmentRules;
  components: ComponentRules;
}

export interface TypeScriptRules {
  strictMode: boolean;
  explicitTypes: boolean;
  avoidAny: boolean;
  preferUnknown: boolean;
  advancedFeatures: string[];
  projectStructure: string[];
}

export interface NextJSRules {
  dynamicRoutes: boolean;
  validateRouteParams: boolean;
  preferFlatRoutes: boolean;
  dataFetching: string[];
  imageOptimization: boolean;
  performanceOptimizations: string[];
}

export interface TailwindRules {
  utilityFirst: boolean;
  avoidCustomCSS: boolean;
  classOrder: boolean;
  responsiveDesign: boolean;
  designTokens: boolean;
}

export interface DaisyUIRules {
  rapidDevelopment: boolean;
  customizeOnlyWhenNecessary: boolean;
  consistentComponents: boolean;
}

export interface StarknetRules {
  centralizedConnection: boolean;
  errorHandling: boolean;
  transactionManagement: boolean;
  uiFeedback: boolean;
}

export interface CairoRules {
  modularStructure: boolean;
  gasOptimization: boolean;
  documentation: boolean;
  explainComplexLogic: boolean;
}

export interface BiomeRules {
  formatting: boolean;
  linting: boolean;
  preCommitHook: boolean;
  organizeImports: boolean;
  cicdIntegration: boolean;
}

export interface DevelopmentRules {
  codeReviews: boolean;
  automatedTesting: boolean;
  conventionalCommits: boolean;
  incrementalCommits: boolean;
}

export interface ComponentRules {
  reusability: boolean;
  modularity: boolean;
  namingConventions: boolean;
  propValidation: boolean;
  accessibility: boolean;
  responsiveDesign: boolean;
  errorHandling: boolean;
  loadingStates: boolean;
  animations: boolean;
  apiIntegrations: boolean;
  performance: boolean;
  testing: boolean;
  documentation: boolean;
}

export const taskmasterConfig: TaskmasterConfig = {
  typescript: {
    strictMode: true,
    explicitTypes: true,
    avoidAny: true,
    preferUnknown: true,
    advancedFeatures: [
      'type guards',
      'mapped types',
      'conditional types',
      'utility types',
      'discriminated unions',
    ],
    projectStructure: ['components', 'pages', 'hooks', 'utils', 'styles', 'contracts', 'services'],
  },
  nextjs: {
    dynamicRoutes: true,
    validateRouteParams: true,
    preferFlatRoutes: true,
    dataFetching: ['getServerSideProps', 'getStaticProps', 'getStaticPaths', 'ISR'],
    imageOptimization: true,
    performanceOptimizations: [
      'next/image',
      'dynamic imports',
      'code splitting',
      'bundle analysis',
    ],
  },
  tailwind: {
    utilityFirst: true,
    avoidCustomCSS: true,
    classOrder: true,
    responsiveDesign: true,
    designTokens: true,
  },
  daisyui: {
    rapidDevelopment: true,
    customizeOnlyWhenNecessary: true,
    consistentComponents: true,
  },
  starknet: {
    centralizedConnection: true,
    errorHandling: true,
    transactionManagement: true,
    uiFeedback: true,
  },
  cairo: {
    modularStructure: true,
    gasOptimization: true,
    documentation: true,
    explainComplexLogic: true,
  },
  biome: {
    formatting: true,
    linting: true,
    preCommitHook: true,
    organizeImports: true,
    cicdIntegration: true,
  },
  development: {
    codeReviews: true,
    automatedTesting: true,
    conventionalCommits: true,
    incrementalCommits: true,
  },
  components: {
    reusability: true,
    modularity: true,
    namingConventions: true,
    propValidation: true,
    accessibility: true,
    responsiveDesign: true,
    errorHandling: true,
    loadingStates: true,
    animations: true,
    apiIntegrations: true,
    performance: true,
    testing: true,
    documentation: true,
  },
};

export default taskmasterConfig;
