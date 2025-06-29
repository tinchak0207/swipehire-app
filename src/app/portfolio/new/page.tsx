'use client';

import React from 'react';
import PortfolioCreationWizard from '@/components/portfolio/PortfolioCreationWizard';

/**
 * New Portfolio Creation Page
 *
 * Features a full-screen immersive wizard experience with:
 * - Gradient backgrounds that transition between steps
 * - Smooth animations and transitions
 * - Mobile-first responsive design
 * - Glass-morphism effects
 * - Smart validation and keyboard navigation
 * - Celebration success state
 */
const NewPortfolioPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      <PortfolioCreationWizard />
    </div>
  );
};

export default NewPortfolioPage;
