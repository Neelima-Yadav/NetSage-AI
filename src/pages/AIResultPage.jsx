import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getDiagnosis } from "../services/api";
import DiagnosisTimeline from "../components/DiagnosisTimeline";
import OSILayerVisualizer from "../components/OSILayerVisualizer";
import ConfidenceGauge from "../components/ConfidenceGauge";
import { Terminal, Shield, Clipboard, Check, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";

export default function AIResultPage() {
  const { id } = useParams();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  
  // Accordion state
  const [showOriginalData, setShowOriginalData] = useState(false);
  
  // Copy states
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const loadDiagnosis = async () => {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      const record = await getDiagnosis(id);

      setDiagnosis({
        ...record,
        id: record.diagnosis_id,
        conceptTag: record.concept_tag,
        topologyNotes: record.topology_notes,
        commandOutput: record.show_command_output,
        rootCause: record.root_cause,
        osiLayer: record.osi_layer,
        recommendedNextShowCommand: record.recommended_next_show_command,
        suggestedConfigurationChanges: record.suggested_configuration_changes,
        stepByStepTroubleshootingGuide: record.step_by_step_troubleshooting,
        ruleValidation: record.rule_validation,
      });
    } catch (requestError) {
      console.error("Unable to load diagnosis:", requestError);
      setDiagnosis(null);
      if (requestError.status === 404) {
        setNotFound(true);
      } else {
        setError(requestError.message || "Unable to load the diagnosis. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnosis();
  }, [id]);

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading diagnosis...</div>;
  }

  if (!diagnosis) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white">
          {notFound ? "Diagnosis Not Found" : "Unable to Load Diagnosis"}
        </h2>
        <p className="text-slate-400 mt-2">
          {notFound ? `The request ID ${id} was not resolved by the service.` : error}
        </p>
        <Link to="/history" className="mt-4 inline-flex text-brand-cyan hover:underline">
          Go back to History
        </Link>
      </div>
    );
  }

  // Color helper for severity
  const getSeverityStyle = (sev) => {
    switch (sev) {
      case "Critical": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  // Color helper for review status
  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Edited": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Rejected": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-8 pb-12">
      
      {/* Page Header / Summary Card */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">{diagnosis.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getSeverityStyle(diagnosis.severity)}`}>
              {diagnosis.severity}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusStyle(diagnosis.status)}`}>
              {diagnosis.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Diagnosed on {new Date(diagnosis.timestamp).toLocaleString()} &bull; Tag: <strong className="text-brand-cyan">{diagnosis.conceptTag}</strong>
          </p>
        </div>

        {/* CTA to Review */}
        {diagnosis.status === "Pending Review" && (
          <Link
            to={`/review/${diagnosis.id}`}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-semibold rounded-lg hover:brightness-110 shadow-md shadow-brand-purple/15 hover:shadow-brand-purple/25 transition-all"
          >
            <span>Proceed to Human Review</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Diagnosis Timeline Stepper */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Diagnosis Timeline</h3>
        <DiagnosisTimeline currentStatus={diagnosis.status} />
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (AI findings and recommendations) */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* Root Cause Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-tr from-brand-blue/5 via-brand-purple/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-brand-cyan/20">
              <Shield className="h-16 w-16" />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Isolated Root Cause</h3>
            <p className="text-lg font-semibold text-slate-200 leading-snug">{diagnosis.rootCause}</p>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">AI Recommendations</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Follow these troubleshooting adjustments to rectify local configuration parameters.</p>
            </div>

            {/* Suggested Configuration Changes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Suggested Configuration Changes</span>
                <button
                  onClick={() => copyToClipboard(diagnosis.suggestedConfigurationChanges, setCopiedConfig)}
                  className="flex items-center space-x-1 text-[10px] text-brand-cyan hover:text-white transition-colors focus:outline-none"
                >
                  {copiedConfig ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                  <span>{copiedConfig ? "Copied" : "Copy configuration"}</span>
                </button>
              </div>
              <div className="cli-container p-4 rounded-xl relative">
                <pre className="font-mono text-xs text-brand-cyan leading-relaxed whitespace-pre-wrap">
                  {diagnosis.suggestedConfigurationChanges}
                </pre>
              </div>
            </div>

            {/* Recommended Next Show Command */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Recommended Next Show Command</span>
                <button
                  onClick={() => copyToClipboard(diagnosis.recommendedNextShowCommand, setCopiedCommand)}
                  className="flex items-center space-x-1 text-[10px] text-brand-cyan hover:text-white transition-colors focus:outline-none"
                >
                  {copiedCommand ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                  <span>{copiedCommand ? "Copied" : "Copy command"}</span>
                </button>
              </div>
              <div className="bg-slate-950 border border-white/5 p-3 rounded-lg flex items-center justify-between font-mono text-xs">
                <span className="text-purple-300 font-bold">{diagnosis.recommendedNextShowCommand}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Execute to verify</span>
              </div>
            </div>

            {/* Step-by-Step Troubleshooting Guide */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">Step-by-Step Troubleshooting Guide</span>
              <div className="flex flex-col space-y-3">
                {diagnosis.stepByStepTroubleshootingGuide.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="leading-normal">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidence Analysis */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Evidence & CLI Indicators</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{diagnosis.evidence}</p>
          </div>

        </div>

        {/* Right Column (Metrics and Rule checks) */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          
          {/* AI Metrics card (Confidence + OSI) */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <ConfidenceGauge confidence={diagnosis.confidence} size={130} />
          </div>

          {/* OSI Layer Visualizer */}
          <div className="glass-card p-5 rounded-2xl border border-white/5">
            <OSILayerVisualizer highlightedLayer={diagnosis.osiLayer} />
          </div>

          {/* Rule Validation Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Rule Validation</h3>
                <span className="text-[10px] text-slate-500">8 deterministic subnet constraints</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-brand-cyan">{diagnosis.ruleValidation.overall_score}</span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Passed</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {diagnosis.ruleValidation.checks.map((check, idx) => {
                let badge = "";
                let itemColor = "";
                if (check.status === "PASS") {
                  badge = "✔ Pass";
                  itemColor = "text-emerald-400";
                } else if (check.status === "WARN") {
                  badge = "⚠ Warn";
                  itemColor = "text-amber-400";
                } else {
                  badge = "✖ Fail";
                  itemColor = "text-red-400";
                }

                return (
                  <div key={idx} className="flex flex-col p-2.5 rounded bg-slate-950/40 border border-white/5 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-300">{check.rule} Check</span>
                      <span className={itemColor}>{badge}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {check.message}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Accordion for Original Input Data */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <button
          onClick={() => setShowOriginalData(!showOriginalData)}
          className="w-full flex items-center justify-between px-6 py-4 bg-slate-950/20 text-slate-300 hover:text-white transition-colors focus:outline-none"
        >
          <span className="text-sm font-bold flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span>Show Original Input Data</span>
          </span>
          {showOriginalData ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showOriginalData && (
          <div className="p-6 border-t border-white/5 bg-slate-950/40 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Symptom Logged</span>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-white/5 leading-relaxed">
                {diagnosis.symptom}
              </p>
              {diagnosis.topologyNotes && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Topology Context</span>
                  <p className="text-xs text-slate-500 leading-normal italic">{diagnosis.topologyNotes}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cisco Command Output</span>
              <pre className="p-4 bg-slate-950 border border-white/5 rounded-xl font-mono text-xs text-brand-cyan overflow-x-auto max-h-60">
                {diagnosis.commandOutput}
              </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
