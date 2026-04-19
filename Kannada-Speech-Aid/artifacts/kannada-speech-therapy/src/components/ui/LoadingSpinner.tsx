import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full h-full min-h-[40vh] gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary opacity-80" />
      <p className="text-muted-foreground font-medium animate-pulse">{text}</p>
    </div>
  );
}
