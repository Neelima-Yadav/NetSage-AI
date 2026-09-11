import React from "react";
import { Link } from "react-router-dom";
import { Network, Terminal, ShieldAlert, Cpu, ArrowRight, Zap, CheckCircle2, FileText, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 text-center flex flex-col items-center">
        
        {/* Version Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-blue/10 border border-brand-cyan/20 rounded-full text-xs font-semibold text-brand-cyan mb-6 animate-pulse-slow">
          <Zap className="h-3 w-3" />
          <span>NetSage AI Platform v2.0 Available</span>
        </div>

        {/* Hero Headlines */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Troubleshoot <span className="text-gradient">Cisco Packet Tracer</span> Configurations in Seconds
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
          The ultimate presentation layer assistant. Parse Cisco Show Command outputs, run rule-based logical validations, isolate OSI layers, and generate verified troubleshooting steps.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md">
          <Link
            to="/diagnose"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple text-white text-base font-semibold rounded-xl hover:brightness-110 shadow-xl shadow-brand-cyan/15 hover:shadow-brand-cyan/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Start Diagnose</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-base font-semibold rounded-xl hover:border-white/20 transition-all"
          >
            <span>View Operator Dashboard</span>
          </Link>
        </div>

        {/* Dashboard Preview / Mock Screenshot */}
        <div className="mt-16 w-full max-w-5xl glass-card rounded-2xl border border-white/5 overflow-hidden p-3 relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent z-10" />
          
          {/* Header styling for mockup */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-950/80 rounded-t-xl">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/50" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <span className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1 bg-slate-900/60 px-3 py-1 rounded-md">
              <Terminal className="h-3 w-3 text-brand-cyan" />
              <span>Diagnostic Console: NSAI-20260816-0001</span>
            </div>
            <span className="w-16" />
          </div>

          {/* Body content Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-950/40 p-4 gap-4 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 bg-slate-900/50 border border-brand-cyan/20 rounded-xl">
                <span className="text-xs font-semibold text-brand-cyan block mb-1">Root Cause</span>
                <p className="text-sm font-medium text-slate-300">VLAN 20 is not permitted on the trunk interface FastEthernet 0/24 on Switch S1, blocking all marketing traffic.</p>
              </div>
              <div className="p-4 bg-slate-900/30 border border-white/5 rounded-xl font-mono text-xs text-slate-400 space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">Cisco Show Commands Analyzed</span>
                <div className="text-green-400">S1# show interfaces trunk</div>
                <div>Port        Mode         Encapsulation  Status        Native vlan</div>
                <div>Fa0/24      on           802.1q         trunking      1</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">OSI Layer</span>
                  <span className="text-sm font-bold text-slate-200">Layer 2 (Data Link)</span>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Network className="h-5 w-5" />
                </div>
              </div>
              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                <span className="text-xs text-slate-500 block mb-2">Rule Validation Score</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-slate-100">7/9</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-mono">1 FAIL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Process Workflow Section */}
      <section className="max-w-7xl mx-auto w-full px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          Diagnostic Workflow
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-12">
          The step-by-step logic NetSage AI performs to review, parse, and verify Packet Tracer configurations.
        </p>

        <div className="glass-card rounded-2xl border border-white/5 p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-4">
            
            <div className="flex flex-col items-center w-full md:w-1/5">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-3">
                <Terminal className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-slate-200">Symptoms</span>
              <span className="text-[11px] text-slate-500 text-center mt-1">Capture CLI show output & notes.</span>
            </div>

            <ChevronRight className="hidden md:block h-6 w-6 text-slate-600" />

            <div className="flex flex-col items-center w-full md:w-1/5">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-3">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-slate-200">AI Diagnosis</span>
              <span className="text-[11px] text-slate-500 text-center mt-1">Isolate root cause & OSI layer.</span>
            </div>

            <ChevronRight className="hidden md:block h-6 w-6 text-slate-600" />

            <div className="flex flex-col items-center w-full md:w-1/5">
              <div className="w-12 h-12 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-3">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-slate-200">Rule Validation</span>
              <span className="text-[11px] text-slate-500 text-center mt-1">Evaluate 8 built-in subnet check rules.</span>
            </div>

            <ChevronRight className="hidden md:block h-6 w-6 text-slate-600" />

            <div className="flex flex-col items-center w-full md:w-1/5">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-slate-200">Human Review</span>
              <span className="text-[11px] text-slate-500 text-center mt-1">Admins Accept, Edit or Reject.</span>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            Engineered for Cisco Packet Tracer
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A presentation layer dashboard built to assist CCNA learners, instructors, and engineers in isolating topological defects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col space-y-4">
            <div className="p-3 bg-brand-blue/10 border border-brand-cyan/20 rounded-xl w-12 h-12 flex items-center justify-center text-brand-cyan">
              <Terminal className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">CLI Show Commands</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Accept outputs from Cisco show command logs (`show interface trunk`, `show ip ospf interface`, etc.) and isolate syntax/operational errors.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col space-y-4">
            <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl w-12 h-12 flex items-center justify-center text-brand-cyan">
              <Network className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">OSI Layer Isolation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trace network faults straight to their active layer. Know instantly if a VLAN leakage is L2, IP routing is L3, or ACL configuration is L4.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col space-y-4">
            <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl w-12 h-12 flex items-center justify-center text-brand-purple">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Rule-Based Checks</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Checks Duplicate IP, DHCP status, ACL conflicts, VLAN IDs, Default Gateways, NAT mappings, DNS configurations, and OSPF structures.
            </p>
          </div>

        </div>
      </section>

      {/* Metrics Section */}
      <section className="max-w-7xl mx-auto w-full px-4 py-8 bg-slate-950/30 rounded-3xl border border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="block text-3xl md:text-5xl font-black text-brand-cyan">91.2%</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mt-1">AI Accuracy</span>
          </div>
          <div>
            <span className="block text-3xl md:text-5xl font-black text-brand-blue">280+</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mt-1">Cisco Rules Evaluated</span>
          </div>
          <div>
            <span className="block text-3xl md:text-5xl font-black text-brand-purple">100%</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mt-1">Client-Side SPA</span>
          </div>
          <div>
            <span className="block text-3xl md:text-5xl font-black text-emerald-400">&lt; 2s</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mt-1">Analysis Latency</span>
          </div>
        </div>
      </section>

    </div>
  );
}
