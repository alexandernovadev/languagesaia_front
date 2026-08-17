import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface PageLoaderProps {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Renders a back button next to the retry button on error */
  onBack?: () => void;
  /** Number of skeleton rows to show while loading (default: 4) */
  skeletonRows?: number;
  children: React.ReactNode;
}

export function PageLoader({
  loading,
  error,
  onRetry,
  onBack,
  skeletonRows = 4,
  children,
}: PageLoaderProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" style={{ width: `${100 - i * 8}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-destructive text-sm">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
