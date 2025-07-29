'use client';

import {
  CalendarIcon,
  ExternalLink as ExternalLinkIcon,
  EyeIcon,
  GithubIcon,
  HeartIcon,
  MessageCircleIcon,
  TagIcon,
  Sparkles,
  Globe,
  Award,
  Briefcase,
  Download,
  CreditCard,
  Mail,
} from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import QRCode from 'qrcode.react';
import type { Media, PortfolioDraft, Project } from '@/lib/types/portfolio';
import { cn } from '@/lib/utils';

interface PortfolioPreviewProps {
  portfolio: PortfolioDraft;
}

/**
 * Glassmorphism Card Component
 * Reusable glass card with consistent styling matching DashboardSidebar
 */
const GlassCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
}> = ({ children, className = '', hover = true }) => (
  <div
    className={cn(
      'rounded-xl border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-lg',
      hover && 'transition-all duration-200 hover:scale-[1.02] hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:shadow-xl',
      className
    )}
  >
    {children}
  </div>
);

/**
 * Enhanced PortfolioPreview Component
 * 
 * Beautiful glassmorphism design matching DashboardSidebar aesthetic with:
 * - Gradient backgrounds and glass effects
 * - Smooth animations and hover states
 * - Consistent color palette
 * - Modern typography and spacing
 */
const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ portfolio }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showBusinessCard, setShowBusinessCard] = useState(false);
  const businessCardRef = useRef<HTMLDivElement>(null);

  /**
   * Export business card as PNG using html2canvas-pro
   */
  const exportBusinessCard = async () => {
    if (!businessCardRef.current) {
      console.error('Business card ref not found');
      return;
    }

    setIsExporting(true);
    try {
      // Make sure the business card is visible
      setShowBusinessCard(true);
      
      // Wait for the modal to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!businessCardRef.current) {
        throw new Error('Business card element not found');
      }

      // Import html2canvas-pro dynamically
      const html2canvas = (await import('html2canvas-pro')).default;
      
      // Capture the business card element directly
      const canvas = await html2canvas(businessCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false,
        removeContainer: true,
        width: 1050,
        height: 600
      });

      // Create download link
      const link = document.createElement('a');
      const sanitizedTitle = (portfolio.title || 'portfolio').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${sanitizedTitle}_business_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      console.log('Export successful');
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Digital Business Card Component - Simplified with local QR code
   */
  const BusinessCard = () => {
    const portfolioUrl = `${window.location.origin}/portfolio/view/${portfolio.id}`;
    const topProjects = portfolio.projects.slice(0, 3);
    
    return (
      <div
        ref={businessCardRef}
        className="w-[1050px] h-[600px] relative overflow-hidden print:shadow-none"
        style={{ 
          fontFamily: 'Inter, system-ui, sans-serif',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
          imageRendering: 'crisp-edges'
        }}
      >
        {/* Background Pattern - Simplified for export */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex">
          {/* Left Section - Profile & Info */}
          <div className="flex-1 p-12 flex flex-col justify-between">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 
                    className="text-3xl font-bold text-gray-800 mb-1 leading-tight"
                    style={{ 
                      fontWeight: '800',
                      letterSpacing: '-0.025em',
                      lineHeight: '1.1'
                    }}
                  >
                    {portfolio.title || 'Professional Portfolio'}
                  </h1>
                  <p 
                    className="text-blue-600 font-medium"
                    style={{ fontWeight: '600' }}
                  >
                    SwipeHire Portfolio
                  </p>
                </div>
              </div>

              {/* Description */}
              {portfolio.description && (
                <div className="max-w-md">
                  <p 
                    className="text-gray-700 text-lg leading-relaxed"
                    style={{ 
                      lineHeight: '1.6',
                      fontWeight: '400'
                    }}
                  >
                    {portfolio.description.length > 120 
                      ? `${portfolio.description.substring(0, 120)}...` 
                      : portfolio.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {portfolio.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {portfolio.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={`business-card-tag-${index}`}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: '600',
                        border: '1px solid #93c5fd'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {portfolio.tags.length > 4 && (
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        fontWeight: '600',
                        border: '1px solid #d1d5db'
                      }}
                    >
                      +{portfolio.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">swipehire.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">hello@swipehire.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">{portfolio.projects.length} Projects Showcase</span>
              </div>
            </div>
          </div>

          {/* Right Section - Projects & QR */}
          <div 
            className="w-80 p-8 border-l"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(229, 231, 235, 0.5)'
            }}
          >
            {/* QR Code - 直接使用本地生成的QR码 */}
            <div className="text-center mb-8">
              <div 
                className="inline-block p-4 rounded-2xl"
                style={{ 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              >
                <QRCode
                  value={portfolioUrl}
                  size={96}
                  level="M"
                  includeMargin={false}
                  renderAs="svg"
                  style={{
                    width: '96px',
                    height: '96px',
                    imageRendering: 'crisp-edges'
                  }}
                />
              </div>
              <p 
                className="text-xs text-gray-600 mt-2 font-medium"
                style={{ fontWeight: '500' }}
              >
                Scan to view portfolio
              </p>
            </div>

            {/* Featured Projects */}
            <div className="mb-6">
              <h3 
                className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
                style={{ fontWeight: '700' }}
              >
                <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
                Featured Work
              </h3>
              <div className="space-y-3">
                {topProjects.map((project, index) => (
                  <div 
                    key={`business-card-project-${index}`} 
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(229, 231, 235, 0.5)'
                    }}
                  >
                    <h4 
                      className="font-semibold text-gray-800 text-sm mb-1"
                      style={{ 
                        fontWeight: '600',
                        lineHeight: '1.3'
                      }}
                    >
                      {project.title || `Project ${index + 1}`}
                    </h4>
                    <p 
                      className="text-xs text-gray-600"
                      style={{ 
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {project.description || 'Professional project showcase'}
                    </p>
                    {project.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {project.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={`project-tag-${index}-${tagIndex}`}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: '500'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {portfolio.projects.length === 0 && (
                  <div 
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: '#f9fafb' }}
                  >
                    <p className="text-sm text-gray-600">Portfolio ready for projects</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div 
              className="pt-4 border-t"
              style={{ borderColor: 'rgba(229, 231, 235, 0.5)' }}
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div 
                    className="text-xl font-bold text-blue-600"
                    style={{ fontWeight: '700' }}
                  >
                    {portfolio.projects.length}
                  </div>
                  <div 
                    className="text-xs text-gray-600"
                    style={{ fontWeight: '500' }}
                  >
                    Projects
                  </div>
                </div>
                <div>
                  <div 
                    className="text-xl font-bold"
                    style={{ 
                      fontWeight: '700',
                      color: portfolio.isPublished ? '#059669' : '#d97706'
                    }}
                  >
                    {portfolio.isPublished ? 'Live' : 'Draft'}
                  </div>
                  <div 
                    className="text-xs text-gray-600"
                    style={{ fontWeight: '500' }}
                  >
                    Status
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <div 
          className="absolute bottom-4 left-12 flex items-center gap-2 text-gray-500"
          style={{ fontSize: '11px' }}
        >
          <Briefcase className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Powered by SwipeHire</span>
        </div>
      </div>
    );
  };

  /**
   * Get link icon with consistent styling
   */
  const getLinkIcon = (type: string) => {
    const iconClass = "h-4 w-4 transition-colors duration-200";
    switch (type) {
      case 'github':
        return <GithubIcon className={cn(iconClass, "text-gray-700")} />;
      case 'demo':
        return <EyeIcon className={cn(iconClass, "text-blue-600")} />;
      case 'live':
        return <Globe className={cn(iconClass, "text-green-600")} />;
      default:
        return <ExternalLinkIcon className={cn(iconClass, "text-purple-600")} />;
    }
  };

  /**
   * Render media with glassmorphism styling
   */
  const renderMedia = (mediaItem: Media, index: number) => {
    const mediaClass = "rounded-xl object-cover w-full h-48 shadow-md";
    
    switch (mediaItem.type) {
      case 'image':
        return (
          <div key={index} className="relative overflow-hidden rounded-xl">
            <Image
              src={mediaItem.url}
              alt={mediaItem.alt}
              width={400}
              height={300}
              className={mediaClass}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        );
      case 'video':
        return (
          <video
            key={index}
            src={mediaItem.url}
            poster={mediaItem.poster}
            controls
            className={mediaClass}
          />
        );
      case 'audio':
        return (
          <div
            key={index}
            className="flex h-24 w-full items-center justify-center rounded-xl border border-gray-200/50 bg-gradient-to-r from-blue-50 to-cyan-50"
          >
            <audio src={mediaItem.url} controls className="w-full max-w-sm" />
          </div>
        );
    }
  };

  /**
   * Enhanced project card with glassmorphism
   */
  const renderProjectCard = (project: Project, index: number) => (
    <GlassCard key={project.id} className="p-6 group">
      {/* Project Media */}
      {project.media.length > 0 && (
        <div className="mb-6">
          {project.media.length === 1 && project.media[0] ? (
            renderMedia(project.media[0], 0)
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {project.media.map((mediaItem, mediaIndex) => (
                <div key={mediaIndex} className="flex-shrink-0 w-64">
                  {renderMedia(mediaItem, mediaIndex)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Title */}
      <h3 className="mb-3 font-bold text-gray-800 text-xl group-hover:text-blue-700 transition-colors">
        {project.title || `Project ${index + 1}`}
      </h3>

      {/* Project Description */}
      {project.description && (
        <p className="mb-4 text-gray-600 text-sm leading-relaxed line-clamp-3">
          {project.description}
        </p>
      )}

      {/* Project Tags */}
      {project.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {project.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 font-semibold text-blue-700 text-xs transition-colors hover:bg-blue-200"
            >
              <TagIcon className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Project Links */}
      {project.links.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {project.links.map((link, linkIndex) => (
            <a
              key={linkIndex}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/60 px-3 py-2 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
            >
              {getLinkIcon(link.type)}
              <span>{link.label || link.type}</span>
            </a>
          ))}
        </div>
      )}

      {/* Project Stats */}
      <div className="flex items-center justify-between border-gray-200/50 border-t pt-4 text-gray-500 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <HeartIcon className="h-4 w-4 text-red-500" />
            <span>{project.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircleIcon className="h-4 w-4 text-blue-500" />
            <span>{project.comments?.length || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4" />
          <span>{new Date(project.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </GlassCard>
  );

  /**
   * Render projects based on layout with enhanced styling
   */
  const renderProjects = () => {
    const sortedProjects = [...portfolio.projects].sort((a, b) => (a.order || 0) - (b.order || 0));

    if (sortedProjects.length === 0) {
      return (
        <GlassCard className="py-16 text-center" hover={false}>
          <div className="mb-6 text-6xl">📁</div>
          <h3 className="mb-3 font-bold text-gray-800 text-2xl">No Projects Yet</h3>
          <p className="text-gray-600">Add some projects to showcase your amazing work!</p>
        </GlassCard>
      );
    }

    switch (portfolio.layout) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project, index) => renderProjectCard(project, index))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-8">
            {sortedProjects.map((project, index) => (
              <GlassCard key={project.id} className="p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Media Column */}
                  {project.media.length > 0 && (
                    <div>
                      {project.media.length === 1 && project.media[0] ? (
                        renderMedia(project.media[0], 0)
                      ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {project.media.map((mediaItem, mediaIndex) => (
                            <div key={mediaIndex} className="flex-shrink-0 w-full">
                              {renderMedia(mediaItem, mediaIndex)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content Column */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 text-3xl">
                      {project.title || `Project ${index + 1}`}
                    </h3>

                    {project.description && (
                      <p className="text-gray-600 leading-relaxed">{project.description}</p>
                    )}

                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 font-semibold text-blue-700 text-sm"
                          >
                            <TagIcon className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.links.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {project.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/60 px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
                          >
                            {getLinkIcon(link.type)}
                            <span>{link.label || link.type}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-gray-200/50 border-t pt-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <HeartIcon className="h-4 w-4 text-red-500" />
                          <span>{project.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircleIcon className="h-4 w-4 text-blue-500" />
                          <span>{project.comments?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(project.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {sortedProjects.map((project, index) => (
              <div key={project.id} className="w-80 flex-shrink-0">
                {renderProjectCard(project, index)}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project, index) => renderProjectCard(project, index))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="-top-40 -right-40 absolute h-80 w-80 animate-pulse rounded-full bg-blue-400/10 blur-3xl" />
        <div className="-bottom-40 -left-40 absolute h-80 w-80 animate-pulse rounded-full bg-indigo-400/10 blur-3xl delay-1000" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform animate-pulse rounded-full bg-slate-400/5 blur-3xl delay-500" />
      </div>

      {/* Portfolio Header */}
      <div className="relative z-10 border-gray-200/50 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-4xl text-center">
            {/* Main Title */}
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            
            <h1 className="mb-6 font-extrabold font-montserrat text-5xl text-blue-600 tracking-tight md:text-6xl">
              {portfolio.title || 'Untitled Portfolio'}
            </h1>

            {portfolio.description && (
              <p className="mx-auto mb-8 max-w-2xl font-medium text-black text-xl leading-relaxed md:text-2xl">
                {portfolio.description}
              </p>
            )}

            {/* Tags */}
            {portfolio.tags.length > 0 && (
              <div className="mb-8 flex flex-wrap justify-center gap-3">
                {portfolio.tags.map((tag, index) => (
                  <span
                    key={`portfolio-tag-${index}-${tag}`}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 font-semibold text-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <TagIcon className="h-4 w-4" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Export Business Card Button */}
            <div className="mb-8">
              <button
                onClick={() => setShowBusinessCard(true)}
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 hover:scale-105 hover:shadow-xl"
              >
                <CreditCard className="h-5 w-5" />
                Export Digital Business Card
              </button>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <GlassCard className="p-6 text-center" hover={false}>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="font-bold text-gray-800 text-2xl">{portfolio.projects.length}</div>
                <div className="text-gray-600 text-sm font-medium">Projects</div>
              </GlassCard>

              <GlassCard className="p-6 text-center" hover={false}>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <EyeIcon className="h-6 w-6 text-white" />
                </div>
                <div className="font-bold text-gray-800 text-lg capitalize">{portfolio.layout || 'Grid'}</div>
                <div className="text-gray-600 text-sm font-medium">Layout</div>
              </GlassCard>

              <GlassCard className="p-6 text-center" hover={false}>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="font-bold text-lg">
                  {portfolio.isPublished ? (
                    <span className="text-green-600">Published</span>
                  ) : (
                    <span className="text-yellow-600">Draft</span>
                  )}
                </div>
                <div className="text-gray-600 text-sm font-medium">Status</div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {renderProjects()}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-16 border-gray-200/50 border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="font-medium">Created with SwipeHire Portfolio Builder</p>
          </div>
        </div>
      </div>

      {/* Business Card Modal */}
      {showBusinessCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Digital Business Card</h2>
                  <p className="text-sm text-gray-600">Preview and export your portfolio as a business card</p>
                </div>
              </div>
              <button
                onClick={() => setShowBusinessCard(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Business Card Preview */}
              <div className="mb-6 flex justify-center">
                <div className="transform scale-75 origin-center">
                  <BusinessCard />
                </div>
              </div>

              {/* Export Options */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={exportBusinessCard}
                  disabled={isExporting}
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download PNG
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowBusinessCard(false)}
                  className="inline-flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:scale-105 hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>

              {/* Export Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Export Details</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• High-resolution PNG format (3150x1800px at 3x scale)</li>
                      <li>• Standard business card dimensions (3.5" x 2")</li>
                      <li>• Crisp text rendering with optimized font smoothing</li>
                      <li>• SVG-based QR code for reliable export and crisp rendering</li>
                      <li>• Professional design with your projects showcase</li>
                      <li>• Print-ready quality for professional use</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export-ready Business Card - Hidden but accessible */}
      {showBusinessCard && (
        <div className="fixed top-0 left-0 pointer-events-none opacity-0 z-[-1]">
          <BusinessCard />
        </div>
      )}
    </div>
  );
};

export default PortfolioPreview;