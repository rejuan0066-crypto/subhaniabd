import { Suspense, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import ErrorBoundary from './ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface QueryBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

const DefaultLoader = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const QueryBoundary = ({ children, loadingFallback }: QueryBoundaryProps) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary key="query-boundary">
        <Suspense fallback={loadingFallback || <DefaultLoader />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default QueryBoundary;
