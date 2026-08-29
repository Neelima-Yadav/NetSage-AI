import React from "react";
import { Check, ClipboardList, ShieldAlert, Cpu, Eye, UserCheck, CheckCircle2, AlertTriangle } from "lucide-react";

export default function DiagnosisTimeline({ currentStatus = "Pending Review" }) {
  // Steps list
  const steps = [
    { label: "Symptoms", icon: ClipboardList, desc: "Symptom capture" },
    { label: "Show Command Analysis", icon: Eye, desc: "CLI log parsing" },
    { label: "AI Diagnosis", icon: Cpu, desc: "Logical core analysis" },
    { label: "Rule Validation", icon: ShieldAlert, desc: "Determinism rules" },
    { label: "Human Review", icon: UserCheck, desc: "Expert assessment" },
    { label: "Verified Diagnosis", icon: CheckCircle2, desc: "Final verification" },
  ];

  // Helper to determine step state: 'completed', 'active', or 'pending'
  const getStepState = (index) => {
    if (currentStatus === "Rejected") {
      if (index < 4) return "completed";
      if (index === 4) return "failed"; // Red rejection state at Human Review
      return "pending";
    }

    const map = {
      "Pending Review": 4, // Human Review is currently active/pending input
      "Accepted": 6,       // All steps completed successfully
      "Edited": 6,         // All steps completed successfully (with edits)
    };
    
    const activeIndex = map[currentStatus] || 4;

    if (index < activeIndex) return "completed";
    if (index === activeIndex) return "active";
    return "pending";
  };

  return (
    <div className="w-full py-4 px-2">
      <div className="relative flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        
        {/* Connecting Line (Desktop) */}
        <div className="absolute hidden md:block top-1/2 left-4 right-4 h-0.5 -translate-y-8 bg-slate-800 z-0">
          <div 
            className="h-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple transition-all duration-1000"
            style={{ 
              width: currentStatus === "Pending Review" 
                ? "66%" 
                : currentStatus === "Rejected" 
                ? "66%" 
                : "100%" 
            }}
          />
        </div>

        {/* Steps Loop */}
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const Icon = step.icon;

          let ringColor = "border-slate-800 bg-slate-900 text-slate-500";
          let labelColor = "text-slate-400";
          let pulseEffect = "";

          if (state === "completed") {
            ringColor = "border-brand-blue bg-brand-blue/10 text-brand-cyan";
            labelColor = "text-brand-cyan font-medium";
          } else if (state === "active") {
            ringColor = "border-brand-purple bg-brand-purple/20 text-brand-purple timeline-pulse";
            labelColor = "text-purple-400 font-semibold";
          } else if (state === "failed") {
            ringColor = "border-red-500 bg-red-950/30 text-red-400";
            labelColor = "text-red-400 font-semibold";
          }

          return (
            <div key={idx} className="flex flex-col items-center text-center relative z-10 w-full md:w-1/6">
              
              {/* Step Circle */}
              <div 
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${ringColor}`}
              >
                {state === "completed" ? (
                  <Check className="h-5 w-5" />
                ) : state === "failed" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              {/* Step Info */}
              <div className="mt-2">
                <span className={`block text-xs uppercase tracking-wider ${labelColor}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
