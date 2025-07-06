'use client';

import {
  CalendarIcon,
  ExternalLinkIcon,
  EyeIcon,
  GithubIcon,
  HeartIcon,
  MessageCircleIcon,
  TagIcon,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Media, PortfolioDraft, Project } from '@/lib/types/portfolio';

interface PortfolioPreviewProps {
  portfolio: PortfolioDraft;
}

/**
 * PortfolioPreview Component
 *
 * A real-time preview component that displays how the portfolio will look
 * when published. Supports different layouts (grid, list, carousel) and
 * responsive design.
 */
const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ portfolio }) => {
  /**
   * Get link icon based on type
   */
  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <GithubIcon className="w-4 h-4" />;
      case 'demo':
        return <EyeIcon className="w-4 h-4" />;
      default:
        return <ExternalLinkIcon className="w-4 h-4" />;
    }
  };

  /**
   * Render media item
   */
  const renderMedia = (mediaItem: Media, index: number) => {
    switch (mediaItem.type) {
      case 'image':
        return (
          <Image
            key={index}
            src={mediaItem.url}
            alt={mediaItem.alt}
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-lg"
          />
        );
      case 'video':
        return (
          <video
            key={index}
            src={mediaItem.url}
            poster={mediaItem.poster}
            controls
            className="w-full h-48 object-cover rounded-lg"
          />
        );
      case 'audio':
        return (
          <div
            key={index}
            className="w-full h-24 bg-base-200 rounded-lg flex items-center justify-center"
          >
            <audio src={mediaItem.url} controls className="w-full max-w-sm" />
          </div>
        );
    }
  };

  /**
   * Render project card
   */
  const renderProjectCard = (project: Project, index: number) => (
    <div key={project.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body p-6">
        {/* Project Media */}
        {project.media.length > 0 && (
          <div className="mb-4">
            {project.media.length === 1 && project.media[0] ? (
              renderMedia(project.media[0], 0)
            ) : (
              <div className="carousel carousel-center max-w-full space-x-4">
                {project.media.map((mediaItem, mediaIndex) => (
                  <div key={mediaIndex} className="carousel-item">
                    {renderMedia(mediaItem, mediaIndex)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Project Title */}
        <h3 className="card-title text-xl mb-2">{project.title || `Project ${index + 1}`}</h3>

        {/* Project Description */}
        {project.description && (
          <p className="text-base-content/80 mb-4 line-clamp-3">{project.description}</p>
        )}

        {/* Project Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag, tagIndex) => (
              <div key={tagIndex} className="badge badge-outline badge-sm">
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Project Links */}
        {project.links.length > 0 && (
          <div className="card-actions justify-start">
            {project.links.map((link, linkIndex) => (
              <a
                key={linkIndex}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                {getLinkIcon(link.type)}
                <span className="ml-2">{link.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Project Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm text-base-content/60">
          <div className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4" />
            <span>{project.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircleIcon className="w-4 h-4" />
            <span>{project.comments.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render projects based on layout
   */
  const renderProjects = () => {
    const sortedProjects = [...portfolio.projects].sort((a, b) => a.order - b.order);

    if (sortedProjects.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-medium mb-2">No Projects Yet</h3>
          <p className="text-base-content/60">Add some projects to see them in the preview.</p>
        </div>
      );
    }

    switch (portfolio.layout) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map((project, index) => renderProjectCard(project, index))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-8">
            {sortedProjects.map((project, index) => (
              <div key={project.id} className="card bg-base-100 shadow-lg">
                <div className="card-body p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Media Column */}
                    {project.media.length > 0 && (
                      <div>
                        {project.media.length === 1 && project.media[0] ? (
                          renderMedia(project.media[0], 0)
                        ) : (
                          <div className="carousel carousel-center w-full space-x-4">
                            {project.media.map((mediaItem, mediaIndex) => (
                              <div key={mediaIndex} className="carousel-item w-full">
                                {renderMedia(mediaItem, mediaIndex)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Column */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">
                        {project.title || `Project ${index + 1}`}
                      </h3>

                      {project.description && (
                        <p className="text-base-content/80">{project.description}</p>
                      )}

                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, tagIndex) => (
                            <div key={tagIndex} className="badge badge-outline">
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                            </div>
                          ))}
                        </div>
                      )}

                      {project.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                            >
                              {getLinkIcon(link.type)}
                              <span className="ml-2">{link.label}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-base-content/60">
                        <div className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{project.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircleIcon className="w-4 h-4" />
                          <span>{project.comments.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="carousel carousel-center max-w-full space-x-6 p-4">
            {sortedProjects.map((project, index) => (
              <div key={project.id} className="carousel-item w-80 flex-shrink-0">
                {renderProjectCard(project, index)}
              </div>
            ))}
          </div>
        );

      default:
        return renderProjects();
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Portfolio Header */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{portfolio.title || 'Untitled Portfolio'}</h1>

            {portfolio.description && (
              <p className="text-lg text-base-content/80 mb-6">{portfolio.description}</p>
            )}

            {portfolio.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {portfolio.tags.map((tag, index) => (
                  <div key={index} className="badge badge-primary badge-lg">
                    <TagIcon className="w-4 h-4 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio Stats */}
            <div className="stats stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Projects</div>
                <div className="stat-value text-2xl">{portfolio.projects.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Layout</div>
                <div className="stat-value text-lg capitalize">{portfolio.layout}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Status</div>
                <div className="stat-value text-lg">
                  {portfolio.isPublished ? (
                    <span className="text-success">Published</span>
                  ) : (
                    <span className="text-warning">Draft</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="container mx-auto px-6 py-8">{renderProjects()}</div>

      {/* Footer */}
      <div className="bg-base-100 mt-12">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-base-content/60">Created with SwipeHire Portfolio Builder</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;
