import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EssenceEditor } from '@/components/essence-editor';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <main className="h-screen w-screen bg-background">
            <EssenceEditor />
          </main>
        } />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}