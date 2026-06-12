import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = "Memuat...", fullScreen = false }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-upn-green-700/30" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-upn-green-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-green-300">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-upn-green-400" />
      <span className="text-sm text-green-300/70">{text}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`shimmer rounded-lg ${className}`} />
  );
}
