'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { CloudFile, CloudStorageProvider } from '../types';

/**
 * Cloud Storage Modal Component
 *
 * Features:
 * - Multi-provider cloud storage integration
 * - Secure OAuth authentication flow
 * - File browser with search and filtering
 * - Batch file selection
 * - Real-time sync status
 *
 * DaisyUI Components:
 * - modal, card, btn, badge, loading, input, dropdown
 *
 * Accessibility:
 * - ARIA labels and descriptions
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 */

interface CloudStorageModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFileSelect: (files: File[]) => void;
}

interface CloudStorageState {
  readonly selectedProvider: CloudStorageProvider | null;
  readonly isConnecting: boolean;
  readonly isLoadingFiles: boolean;
  readonly files: CloudFile[];
  readonly selectedFiles: Set<string>;
  readonly searchQuery: string;
  readonly currentFolder: string;
}

const mockProviders: CloudStorageProvider[] = [
  {
    name: 'google-drive',
    displayName: 'Google Drive',
    icon: '📁',
    isConnected: false,
    authUrl: 'https://accounts.google.com/oauth/authorize',
  },
  {
    name: 'dropbox',
    displayName: 'Dropbox',
    icon: '📦',
    isConnected: false,
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
  },
  {
    name: 'onedrive',
    displayName: 'OneDrive',
    icon: '☁️',
    isConnected: false,
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  },
  {
    name: 'box',
    displayName: 'Box',
    icon: '📋',
    isConnected: false,
    authUrl: 'https://account.box.com/api/oauth2/authorize',
  },
];

const mockFiles: CloudFile[] = [
  {
    id: 'file-1',
    name: 'John_Doe_Resume_2024.pdf',
    size: 245760,
    type: 'application/pdf',
    modifiedDate: new Date('2024-01-15'),
    downloadUrl: 'https://example.com/file1',
    thumbnailUrl: 'https://example.com/thumb1',
    provider: 'google-drive',
  },
  {
    id: 'file-2',
    name: 'Cover_Letter_TechCorp.docx',
    size: 123456,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    modifiedDate: new Date('2024-01-10'),
    downloadUrl: 'https://example.com/file2',
    provider: 'google-drive',
  },
  {
    id: 'file-3',
    name: 'Portfolio_Projects.pdf',
    size: 567890,
    type: 'application/pdf',
    modifiedDate: new Date('2024-01-05'),
    downloadUrl: 'https://example.com/file3',
    provider: 'google-drive',
  },
];

export const CloudStorageModal: React.FC<CloudStorageModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
}) => {
  const [state, setState] = useState<CloudStorageState>({
    selectedProvider: null,
    isConnecting: false,
    isLoadingFiles: false,
    files: [],
    selectedFiles: new Set(),
    searchQuery: '',
    currentFolder: '/',
  });

  const loadFiles = useCallback(async (provider: CloudStorageProvider) => {
    try {
      // Simulate file loading
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real implementation, this would make API calls to:
      // - Google Drive API
      // - Dropbox API
      // - Microsoft Graph API
      // - Box API

      setState((prev) => ({
        ...prev,
        isLoadingFiles: false,
        files: mockFiles.filter((file) => file.provider === provider.name),
      }));
    } catch (error) {
      console.error('Error loading files:', error);
      setState((prev) => ({
        ...prev,
        isLoadingFiles: false,
        error: 'Failed to load files. Please try again.',
      }));
    }
  }, []);

  const handleProviderConnect = useCallback(async (provider: CloudStorageProvider) => {
    setState((prev) => ({ ...prev, isConnecting: true }));
    
    try {
      // Simulate connection process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real implementation, this would:
      // - Redirect to OAuth flow
      // - Handle authentication callbacks
      // - Store access tokens securely
      
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        selectedProvider: provider,
        files: [],
        currentPath: '/',
      }));
    } catch (error) {
      console.error('Error connecting to provider:', error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect. Please try again.',
      }));
    }
  }, []);

  useEffect(() => {
    if (state.selectedProvider) {
      setState((prev) => ({ ...prev, isLoadingFiles: true, files: [] }));
      loadFiles(state.selectedProvider);
    }
  }, [state.selectedProvider, loadFiles]);

  const handleFileToggle = useCallback((fileId: string) => {
    setState((prev) => {
      const newSelectedFiles = new Set(prev.selectedFiles);
      if (newSelectedFiles.has(fileId)) {
        newSelectedFiles.delete(fileId);
      } else {
        newSelectedFiles.add(fileId);
      }
      return { ...prev, selectedFiles: newSelectedFiles };
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFiles: new Set(prev.files.map((file) => file.id)),
    }));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFiles: new Set(),
    }));
  }, []);

  const handleImportSelected = useCallback(async () => {
    const selectedFileObjects = state.files.filter((file) => state.selectedFiles.has(file.id));

    try {
      // For demo purposes, create mock files
      // In a real implementation, this would download the files from cloud storage
      const files = selectedFileObjects.map(
        (cloudFile) => new File(['mock content'], cloudFile.name, { type: cloudFile.type })
      );

      onFileSelect(files);
      onClose();
    } catch (error) {
      console.error('Failed to import files:', error);
    }
  }, [state.files, state.selectedFiles, onFileSelect, onClose]);

  const filteredFiles = state.files.filter((file) =>
    file.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-4xl transform overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
          {/* Header */}
          <div className="border-base-300 border-b p-6">
            <Dialog.Title className="flex items-center gap-3 font-bold text-2xl">
              <span className="text-3xl">☁️</span>
              Import from Cloud Storage
              {state.selectedProvider && (
                <span className="badge badge-primary badge-lg">
                  {state.selectedProvider.displayName}
                </span>
              )}
            </Dialog.Title>
          </div>

          <div className="flex h-[calc(90vh-8rem)]">
            {/* Provider Selection Sidebar */}
            {!state.selectedProvider && (
              <div className="w-80 border-base-300 border-r bg-base-50 p-6">
                <h3 className="mb-4 font-semibold text-lg">Choose Provider</h3>
                <div className="space-y-3">
                  {mockProviders.map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => handleProviderConnect(provider)}
                      disabled={state.isConnecting}
                      className={`btn btn-outline btn-lg w-full justify-start gap-4 transition-all duration-200 hover:scale-105 ${
                        state.isConnecting ? 'loading' : ''
                      }`}
                    >
                      <span className="text-2xl">{provider.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{provider.displayName}</div>
                        <div className="text-xs opacity-60">
                          {provider.isConnected ? 'Connected' : 'Not connected'}
                        </div>
                      </div>
                      {provider.isConnected && (
                        <span className="badge badge-success badge-sm ml-auto">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-info/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-info">
                    <span>🔒</span>
                    <span className="font-semibold text-sm">Secure Connection</span>
                  </div>
                  <p className="text-base-content/70 text-xs">
                    Your files are accessed securely using OAuth 2.0. We never store your
                    credentials and only read files you explicitly select.
                  </p>
                </div>
              </div>
            )}

            {/* File Browser */}
            {state.selectedProvider && (
              <div className="flex flex-1 flex-col">
                {/* File Browser Header */}
                <div className="border-base-300 border-b bg-base-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            selectedProvider: null,
                            files: [],
                            selectedFiles: new Set(),
                          }))
                        }
                        className="btn btn-ghost btn-sm"
                      >
                        ← Back
                      </button>
                      <span className="font-semibold text-lg">
                        {state.selectedProvider.displayName} Files
                      </span>
                    </div>

                    {state.selectedFiles.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-base-content/60 text-sm">
                          {state.selectedFiles.size} selected
                        </span>
                        <button onClick={handleDeselectAll} className="btn btn-ghost btn-xs">
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Search and Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={state.searchQuery}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            searchQuery: e.target.value,
                          }))
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                    <button
                      onClick={handleSelectAll}
                      className="btn btn-outline btn-sm"
                      disabled={state.files.length === 0}
                    >
                      Select All
                    </button>
                  </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {state.isLoadingFiles ? (
                    <div className="flex h-64 items-center justify-center">
                      <div className="space-y-4 text-center">
                        <div className="loading loading-spinner loading-lg text-primary" />
                        <p className="text-base-content/60">Loading your files...</p>
                      </div>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="flex h-64 items-center justify-center">
                      <div className="space-y-4 text-center">
                        <span className="text-6xl opacity-50">📁</span>
                        <div>
                          <p className="font-semibold text-base-content/60 text-lg">
                            {state.searchQuery ? 'No files found' : 'No files available'}
                          </p>
                          <p className="text-base-content/40 text-sm">
                            {state.searchQuery
                              ? 'Try adjusting your search terms'
                              : 'Upload some files to your cloud storage first'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <AnimatePresence>
                        {filteredFiles.map((file, index) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`card cursor-pointer border bg-base-100 shadow-sm transition-all duration-200 hover:shadow-md ${
                              state.selectedFiles.has(file.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-base-300'
                            }`}
                            onClick={() => handleFileToggle(file.id)}
                          >
                            <div className="card-body p-4">
                              <div className="flex items-center gap-4">
                                {/* File Icon */}
                                <div className="relative">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl">
                                    {file.type.includes('pdf')
                                      ? '📕'
                                      : file.type.includes('word')
                                        ? '📘'
                                        : '📄'}
                                  </div>
                                  {state.selectedFiles.has(file.id) && (
                                    <div className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                      <span className="text-primary-content text-xs">✓</span>
                                    </div>
                                  )}
                                </div>

                                {/* File Info */}
                                <div className="min-w-0 flex-1">
                                  <h5 className="truncate font-semibold text-base-content">
                                    {file.name}
                                  </h5>
                                  <div className="flex items-center gap-3 text-base-content/60 text-sm">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>•</span>
                                    <span>{formatDate(file.modifiedDate)}</span>
                                  </div>
                                </div>

                                {/* Thumbnail */}
                                {file.thumbnailUrl && (
                                  <img
                                    src={file.thumbnailUrl}
                                    alt={`${file.name} thumbnail`}
                                    className="h-16 w-16 rounded border object-cover"
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Import Button */}
                {state.selectedFiles.size > 0 && (
                  <div className="border-base-300 border-t bg-base-50 p-4">
                    <button
                      onClick={handleImportSelected}
                      className="btn btn-primary btn-lg w-full gap-2"
                    >
                      <span>📥</span>
                      Import {state.selectedFiles.size} file
                      {state.selectedFiles.size !== 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-base-300 border-t p-4">
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-lg">Cancel</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CloudStorageModal;
