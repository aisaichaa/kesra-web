import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-20 text-white">
      <div className="flex items-center space-x-2 font-semibold text-lg">
        <img src="/logo.png" alt="Logo Kesra Jabar" className="h-8 w-auto" /> {/* ganti logo kalau ada */}
        <span>Kesra Jabar</span>
      </div>
      <div className="space-x-6 text-sm md:text-base font-medium">
        <Link to="/" className="hover:underline">Beranda</Link>
        <Link to="/absensi" className="hover:underline">Absensi</Link>
        <Link to="/agenda" className="hover:underline">Agenda</Link>
        <Link to="/laporan" className="hover:underline">Laporan</Link>
        <button className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-black transition">Sign in</button>
      </div>
    </nav>
  );
};

export default Navbar;
