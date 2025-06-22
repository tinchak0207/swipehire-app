'use client';

import { UserAvatar, UserAvatarWithNextImage } from '@/components/ui/user-avatar';

export default function TestAvatarPage() {
  const testCases = [
    {
      name: 'Valid Google Avatar',
      src: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      alt: 'John Doe',
      fallbackText: 'JD',
    },
    {
      name: 'Invalid URL',
      src: 'https://invalid-url-that-will-fail.com/avatar.jpg',
      alt: 'Jane Smith',
      fallbackText: 'JS',
    },
    {
      name: 'No URL (null)',
      src: null,
      alt: 'Bob Wilson',
      fallbackText: 'BW',
    },
    {
      name: 'Empty String',
      src: '',
      alt: 'Alice Johnson',
      fallbackText: 'AJ',
    },
    {
      name: 'Backend URL Format',
      src: '/uploads/avatar-123.jpg',
      alt: 'Mike Brown',
      fallbackText: 'MB',
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 font-bold text-3xl">Avatar Component Test</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 font-semibold text-2xl">Radix UI Avatar Implementation</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testCases.map((testCase, index) => (
              <div key={index} className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">{testCase.name}</h3>
                <div className="mb-2 flex items-center gap-4">
                  <UserAvatar
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="sm"
                  />
                  <UserAvatar
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="md"
                  />
                  <UserAvatar
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="lg"
                  />
                  <UserAvatar
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="xl"
                  />
                </div>
                <p className="text-muted-foreground text-sm">URL: {testCase.src || 'null'}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-semibold text-2xl">Next.js Image Implementation</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testCases.map((testCase, index) => (
              <div key={index} className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">{testCase.name}</h3>
                <div className="mb-2 flex items-center gap-4">
                  <UserAvatarWithNextImage
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="sm"
                  />
                  <UserAvatarWithNextImage
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="md"
                  />
                  <UserAvatarWithNextImage
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="lg"
                  />
                  <UserAvatarWithNextImage
                    src={testCase.src}
                    alt={testCase.alt}
                    fallbackText={testCase.fallbackText}
                    size="xl"
                  />
                </div>
                <p className="text-muted-foreground text-sm">URL: {testCase.src || 'null'}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-semibold text-2xl">Icon Fallback vs Text Fallback</h2>
          <div className="flex gap-8">
            <div className="space-y-4">
              <h3 className="font-medium">With Icon Fallback</h3>
              <UserAvatar src={null} alt="Test User" size="lg" showFallbackIcon={true} />
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">With Text Fallback</h3>
              <UserAvatar
                src={null}
                alt="Test User"
                fallbackText="TU"
                size="lg"
                showFallbackIcon={false}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
