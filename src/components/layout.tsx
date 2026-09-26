// src/components/Layout.tsx
import Navbar from './navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white p-4">
          <ul className="space-y-2">
            <li><a href="/" className="block hover:bg-secondary p-2 rounded">Beranda</a></li>
            <li><a href="/absensi" className="block hover:bg-secondary p-2 rounded">Absensi</a></li>
            <li><a href="/agenda" className="block hover:bg-secondary p-2 rounded">Agenda</a></li>
            <li><a href="/laporan" className="block hover:bg-secondary p-2 rounded">Laporan</a></li>
          </ul>
        </aside>

        {/* Konten */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}