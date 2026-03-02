import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative flex items-center justify-center">
        <Spinner className="h-12 w-12 text-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading content...
      </p>
    </div>
  );
}