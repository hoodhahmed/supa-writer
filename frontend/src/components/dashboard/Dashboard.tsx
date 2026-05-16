import { Link } from 'react-router-dom';
import { useDocuments } from '@/features/editor/hooks/useDocuments';

export default function Dashboard() {
  const { documents, createNewDoc, deleteDoc, loading } = useDocuments();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={() => void createNewDoc()}
              className="rounded-md bg-[#33C3FF] px-4 py-2 text-sm font-medium text-white hover:opacity-95 w-full sm:w-auto"
            >
              New Document
            </button>
            <Link to="/app" className="text-center text-sm text-[#33C3FF] hover:underline">Open Editor</Link>
          </div>
        </div>

        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <div className="rounded-lg bg-paper border p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Your Documents</h2>
            <p className="mt-2 text-sm text-[#555555]">Quick access to your recent documents.</p>

            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 w-1/3 rounded bg-[#EFEFEF] animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-[#EFEFEF] animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-[#EFEFEF] animate-pulse" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-sm text-[#777]">You have no documents yet. Create one to get started.</div>
              ) : (
                <ul role="list" className="space-y-3" aria-label="Recent documents">
                  {documents.map((doc) => (
                    <li key={doc.id} role="listitem">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-3 bg-white gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{doc.title}</div>
                          <div className="text-xs text-[#666]">{new Date(doc.lastModified).toLocaleString()}</div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Link to={`/app?doc=${encodeURIComponent(doc.id)}`} className="text-[#33C3FF] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33C3FF]" aria-label={`Open ${doc.title}`}>Open</Link>
                          <button
                            onClick={() => void deleteDoc(doc.id)}
                            className="text-[#FF3B30] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B30]"
                            aria-label={`Delete ${doc.title}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-paper border p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Usage</h2>
            <p className="mt-2 text-sm text-[#555555]">AI score usage, storage, and account details.</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#666]">AI Credits Used</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#666]">Storage</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
