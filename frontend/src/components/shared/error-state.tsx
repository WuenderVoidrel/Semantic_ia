import { AlertTriangle } from "lucide-react";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-8 text-center">
      <AlertTriangle className="h-6 w-6 text-rose-600" />
      <p className="max-w-xl text-sm font-medium text-rose-700">{message}</p>
    </div>
  );
}
