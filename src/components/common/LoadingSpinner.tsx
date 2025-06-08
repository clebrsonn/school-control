import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number; // e.g., 4 for h-4 w-4, 8 for h-8 w-8
  fullScreen?: boolean; // To replicate the 100vh centering
  className?: string; // Allow additional classes
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 8, fullScreen = false, className = '' }) => {
  const spinnerSize = `h-${size} w-${size}`;

  if (fullScreen) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${className}`}>
        <Loader2 className={`animate-spin text-primary ${spinnerSize}`} />
      </div>
    );
  }

  return (
    <Loader2 className={`animate-spin text-primary ${spinnerSize} ${className}`} />
  );
};
