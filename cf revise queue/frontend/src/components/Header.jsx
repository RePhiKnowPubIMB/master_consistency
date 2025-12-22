import { Code2, Calendar } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Code2 size={40} className="animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            CF Revise Queue
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-blue-100">
          <Calendar size={18} />
          <p className="text-lg md:text-xl font-light">
            Track Your Codeforces Editorial Journey
          </p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-blue-200 opacity-90">
            Add problems after watching editorials • Auto-schedule revisions in 7 days • Stay consistent! 🚀
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
