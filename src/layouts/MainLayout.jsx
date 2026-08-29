import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Network, BarChart2, Activity, History, Info, Menu, X, PlusCircle } from "lucide-react";

export default function MainLayout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: BarChart2 },
    { name: "Diagnose", path: "/diagnose", icon: Activity },
    { name: "History", path: "/history", icon: History },
    { name: "About", path: "/about", icon: Info },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col relative">
      {/* Background Ambient Glows */}
      <div className="glow-orb-purple top-10 left-10" />
      <div className="glow-orb-cyan bottom-20 right-10" />
      <div className="glow-orb-blue top-1/2 left-1/3" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-tr from-brand-blue via-brand-cyan to-brand-purple rounded-xl shadow-lg shadow-brand-blue/20 group-hover:scale-105 transition-transform duration-300">
                <Network className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                NetSage<span className="text-brand-cyan font-extrabold ml-0.5">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-brand-blue/10 text-brand-cyan border border-brand-cyan/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                to="/diagnose"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple text-white text-sm font-semibold rounded-lg hover:brightness-110 shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Start Diagnose</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    active
                      ? "bg-brand-blue/15 text-brand-cyan"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/5">
              <Link
                to="/diagnose"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white text-base font-semibold rounded-lg hover:brightness-110 shadow-md shadow-brand-cyan/10 transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Start Diagnose</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/40 backdrop-blur-md py-8 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          <div className="flex items-center space-x-3">
            <Network className="h-5 w-5 text-brand-cyan" />
            <span className="text-sm text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} NetSage AI. Presentation Layer Dashboard.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <Link to="/about" className="hover:text-white transition-colors">Documentation</Link>
            <span className="text-white/10">|</span>
            <span className="text-xs text-slate-500 font-mono">Cisco Packet Tracer Troubleshooting</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
