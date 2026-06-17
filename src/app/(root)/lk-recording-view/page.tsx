import { Suspense } from 'react';
import RecordingViewClient from '@/components/conference/RecordingViewClient';

export default function LiveKitRecordingViewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen w-screen items-center justify-center bg-slate-950 p-4 text-white">
          <div className="rounded-xl bg-slate-900 p-6 text-lg">Loading...</div>
        </main>
      }
    >
      <RecordingViewClient />
    </Suspense>
  );
}
