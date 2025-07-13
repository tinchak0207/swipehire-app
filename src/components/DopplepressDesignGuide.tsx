import type React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
}
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
const Button = ({ children, className }: ButtonProps) => (
  <button className={className}>{children}</button>
);
const Card = ({ children, className }: CardProps) => <div className={className}>{children}</div>;

// Typography
export const TypographyStyles = {
  display: 'text-4xl font-bold leading-tight',
  title: 'text-2xl font-semibold',
  subtitle: 'text-lg font-medium text-gray-600',
  body: 'text-base font-normal',
};

// Button Component
export const DopplepressButton = ({ children }: { children: React.ReactNode }) => (
  <Button
    className={`rounded-full px-6 py-3 shadow-sm hover:shadow-md 
               transition-all duration-200 bg-primary hover:bg-primary-dark`}
  >
    {children}
  </Button>
);

// Card Component
export const DopplepressCard = ({ children }: { children: React.ReactNode }) => (
  <Card
    className={`shadow-sm rounded-lg border border-gray-100 
               transition-all hover:shadow-md bg-background`}
  >
    {children}
  </Card>
);

// Navigation Styles
export const navigationStyles = {
  container: 'flex items-center justify-between p-4 border-b border-gray-200',
  logo: 'text-lg font-medium',
  navLink: 'hover:text-primary transition-colors',
};

// Usage Examples
export const DopplepressDesignGuide = () => {
  return (
    <div className="p-8">
      <h1 className={TypographyStyles.display}>Dopplepress Design System</h1>

      <section className="mt-8">
        <h2 className={TypographyStyles.title}>Components</h2>

        <div className="mt-4">
          <DopplepressButton>Example Button</DopplepressButton>
        </div>

        <div className="mt-6 w-96">
          <DopplepressCard>
            <div className="p-4">
              <h3 className={TypographyStyles.title}>Card Title</h3>
              <p className={TypographyStyles.body}>
                This is an example card with Dopplepress styling
              </p>
            </div>
          </DopplepressCard>
        </div>
      </section>
    </div>
  );
};
