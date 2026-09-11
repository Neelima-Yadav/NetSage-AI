import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../services/api";
import { BarChart3, ShieldAlert, CheckCircle, XCircle, AlertCircle, Sparkles, TrendingUp, History, UserCheck, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [recentCorrections, setRecentCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const dashboard = await getDashboard();
      setStats(dashboard);
    } catch (requestError) {
      console.error("Unable to load dashboard statistics:", requestError);
      setError(requestError.message || "Unable to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading Dashboard stats...</div>;

  if (!stats) {
    return <div className="text-center py-12 text-slate-400">{error}</div>;
  }

  // Helper to color statuses
  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "Edited": return <Sparkles className="h-4 w-4 text-brand-cyan" />;
      case "Rejected": return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <AlertCircle className="h-4 w-4 text-purple-400" />;
    }
  };

  const getStatusTextClass = (status) => {
    switch (status) {
      case "Accepted": return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25";
      case "Edited": return "text-brand-cyan bg-brand-blue/10 border border-brand-cyan/25";
      case "Rejected": return "text-red-400 bg-red-500/10 border border-red-500/25";
      default: return "text-purple-400 bg-purple-500/10 border border-purple-500/25";
    }
  };

  return (
    <div className="flex flex-col space-y-8 pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white m-0">Operator Control Center</h1>
        <p className="text-slate-400 text-xs mt-1">Real-time statistics for AI Cisco Packet Tracer Troubleshooting Assistant.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Diagnoses */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Diagnoses</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalDiagnoses}</span>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5">
              <TrendingUp className="h-3 w-3" />
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* AI Accuracy */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Accuracy</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-brand-cyan">{stats.aiAccuracy}%</span>
            <span className="text-[9px] text-slate-500 font-mono">Reviewed</span>
          </div>
        </div>

        {/* Human Corrections */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Human Corrections</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-brand-purple">{stats.humanCorrections}</span>
            <span className="text-[9px] text-slate-500 font-mono">Overrides</span>
          </div>
        </div>

        {/* Average Confidence */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg AI Confidence</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-purple-400">{stats.averageConfidence}%</span>
            <span className="text-[9px] text-slate-500 font-mono">Correlation</span>
          </div>
        </div>

      </div>

      {/* Review Status Counts Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="border-r border-white/5">
          <span className="text-[10px] text-slate-500 block">Pending Reviews</span>
          <span className="text-lg font-bold text-purple-400 mt-1 block">{stats.pendingReviews}</span>
        </div>
        <div className="md:border-r border-white/5">
          <span className="text-[10px] text-slate-500 block">Accepted Reviews</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">{stats.acceptedReviews}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[10px] text-slate-500 block">Edited Reviews</span>
          <span className="text-lg font-bold text-brand-cyan mt-1 block">{stats.editedReviews}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Rejected Reviews</span>
          <span className="text-lg font-bold text-red-400 mt-1 block">{stats.rejectedReviews}</span>
        </div>
      </div>

      {/* Common Fault Alert widget */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 bg-gradient-to-r from-red-500/5 to-transparent flex items-center space-x-4">
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-red-400/80 tracking-wider">Most Common Network Fault</span>
          <h4 className="text-sm font-bold text-slate-200 mt-0.5">{stats.mostCommonNetworkFault}</h4>
        </div>
      </div>

      {/* Grid of Distributions (OSI, Issue, Severity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Issue Type Distribution */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Issue Type Distribution</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Top-fault concepts categorized by tag</p>
          </div>
          
          <div className="flex flex-col space-y-3.5">
            {stats.issueDistribution.map((issue) => (
              <div key={issue.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{issue.name} Faults</span>
                  <span className="text-slate-400 font-mono">{issue.count} ({issue.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan rounded-full"
                    style={{ width: `${issue.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OSI Layer Distribution */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">OSI Layer Distribution</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Anomalies isolated across stack layers</p>
          </div>

          <div className="flex flex-col space-y-3.5">
            {stats.osiLayerDistribution.map((layer) => (
              <div key={layer.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{layer.name}</span>
                  <span className="text-slate-400 font-mono">{layer.count} ({layer.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
                    style={{ width: `${layer.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Severity Breakdown</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Urgency assessment logs</p>
          </div>

          <div className="flex flex-col space-y-3.5">
            {stats.severityBreakdown.map((sev) => {
              let color = "from-brand-blue to-brand-cyan";
              if (sev.name === "Critical") color = "from-red-500 to-rose-600";
              else if (sev.name === "High") color = "from-orange-400 to-amber-500";
              else if (sev.name === "Medium") color = "from-yellow-400 to-amber-400";

              return (
                <div key={sev.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{sev.name} Priority</span>
                    <span className="text-slate-400 font-mono">{sev.count} ({sev.percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${color} rounded-full`}
                      style={{ width: `${sev.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Feed Area (Split: Recent Diagnoses vs Recent Corrections) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Diagnoses */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <History className="h-4 w-4 text-slate-400" />
              <span>Recent Diagnoses</span>
            </h3>
            <Link to="/history" className="text-xs text-brand-cyan hover:underline">
              View History
            </Link>
          </div>

          <div className="flex flex-col space-y-3">
            {recentDiagnoses.map((diag) => (
              <div 
                key={diag.id} 
                className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors"
              >
                <div className="space-y-1 flex-grow pr-4">
                  <div className="flex items-center space-x-2">
                    <Link to={`/result/${diag.id}`} className="font-mono text-xs font-bold text-brand-cyan hover:underline">
                      {diag.id}
                    </Link>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      {diag.conceptTag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{diag.symptom}</p>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusTextClass(diag.status)}`}>
                    {diag.status}
                  </span>
                  <Link to={`/result/${diag.id}`} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300">
                    {getStatusIcon(diag.status)}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Corrections Log */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-slate-400" />
            <span>Recent Human Corrections</span>
          </h3>

          <div className="flex flex-col space-y-3">
            {recentCorrections.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-xl leading-relaxed">
                No human corrections logged yet.<br />
                Go to a pending diagnosis and select "Edit" in review panel to submit a correction.
              </div>
            ) : (
              recentCorrections.map((corr, idx) => (
                <div key={idx} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link to={`/result/${corr.id}`} className="font-mono text-[11px] font-bold text-brand-cyan hover:underline">
                        {corr.id}
                      </Link>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-purple/10 text-purple-400 font-bold font-mono">
                        {corr.conceptTag} Correction
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500">{new Date(corr.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    &ldquo;{corr.reviewerNotes}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
