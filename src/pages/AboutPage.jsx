import React from "react";
import { Terminal, Shield, Network, UserCheck, Layers, Cpu, Code } from "lucide-react";

export default function AboutPage() {
  const rules = [
    { title: "Duplicate IP Checks", desc: "Cross-checks configured interface IPs across all virtual and physical interfaces to prevent subnet conflict warnings." },
    { title: "Default Gateway Checks", desc: "Verifies standard switch and router gateways exist and belong to the correct local VLAN subnet range." },
    { title: "VLAN Configuration Checks", desc: "Checks port states (access vs trunk), allowed VLAN lists, native VLAN mismatches, and VTP parameters." },
    { title: "Routing Protocol Checks", desc: "Validates OSPF, EIGRP, and RIP configurations, detecting dead timer intervals, area mismatches, and router ID conflicts." },
    { title: "Access Control List Checks", desc: "Analyzes standard and extended access-list rules, detecting incorrect protocol permits, wrong direction bounds, or implicit denials." },
    { title: "DHCP Validation", desc: "Inspects helper relay addresses, dynamic subnet allocations, lease times, and address pool utilization parameters." },
    { title: "DNS Infrastructure Validation", desc: "Ensures distributed nameserver IPs are reachable, functional, and that lookup translation queries complete." },
    { title: "NAT Overload Mappings", desc: "Validates boundary network address translations, verifying interface classifications (inside/outside) and source lists." },
  ];

  return (
    <div className="flex flex-col space-y-12 pb-16 max-w-4xl mx-auto w-full">
      
      {/* Hero Headline */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white m-0">About NetSage AI</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Providing CCNA students, network instructors, and engineers with an automated, rule-based Cisco Packet Tracer troubleshooting companion.
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-brand-cyan" />
          <span>Diagnostic Philosophy</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Troubleshooting Cisco configurations in educational layouts like Cisco Packet Tracer is usually a time-consuming loop of run commands, ping tests, and manual configuration inspects.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          NetSage AI builds a modern presentation layer that structures this flow. By feeding network symptoms and show command logs, the platform runs a dynamic parser that correlates defects, tags the correct fault zone on the 7-layer OSI model, evaluates 8 check blocks, and provides clear configuration guidelines.
        </p>
      </div>

      {/* 8 Rules Grid */}
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start space-x-2">
            <Shield className="h-5 w-5 text-brand-purple" />
            <span>Built-in Rule Validation Checks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">The 8 distinct verification scopes evaluated in every diagnostic analysis run.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, idx) => (
            <div key={idx} className="glass-card p-5 rounded-xl border border-white/5 flex flex-col space-y-2">
              <span className="text-[10px] text-brand-cyan font-mono font-bold uppercase tracking-wider">Scope 0{idx + 1}</span>
              <h3 className="text-sm font-semibold text-slate-200">{rule.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 text-center space-y-4 bg-gradient-to-tr from-brand-purple/5 to-transparent">
        <h2 className="text-base font-bold text-white flex items-center justify-center space-x-2">
          <Code className="h-4 w-4 text-brand-cyan" />
          <span>Application Presentation Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          NetSage AI is structured as a client-side React SPA with a virtual DataService layer. This layer encapsulates data persistence, ID numbering, and aggregation, making it ready to scale to an API backend (such as FastAPI/Pydantic) without rewriting page components.
        </p>
        
        <div className="p-4 bg-slate-950 border border-white/5 rounded-xl font-mono text-[10px] text-slate-500 text-left max-w-md mx-auto space-y-1">
          <div className="text-brand-cyan">src/</div>
          <div className="pl-4 text-purple-300">├── services/  # DataService layer (localStorage CRUD)</div>
          <div className="pl-4 text-slate-400">├── components/# OSILayer, ConfidenceGauge, Timeline</div>
          <div className="pl-4 text-slate-400">├── layouts/   # MainLayout wrapper (header, nav, footer)</div>
          <div className="pl-4 text-slate-400">├── pages/     # Landing, Diagnose, Result, Review, Dashboard, History</div>
          <div className="pl-4 text-slate-400">└── App.jsx    # Client-side router map (React Router v6)</div>
        </div>
      </div>

    </div>
  );
}
