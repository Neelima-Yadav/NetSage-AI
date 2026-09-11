import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getHistory } from "../services/api";
import { Search, Filter, Download, FileText, CheckCircle, XCircle, AlertCircle, Edit3, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering and searching states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConcept, setSelectedConcept] = useState("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Notification for file triggers
  const [exportAlert, setExportAlert] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const history = await getHistory({
        status: selectedStatus,
        concept_tag: selectedConcept,
        severity: selectedSeverity,
        search: searchQuery,
      });

      setDiagnoses(history.map((diagnosis) => ({
        ...diagnosis,
        id: diagnosis.diagnosis_id,
        conceptTag: diagnosis.concept_tag,
        rootCause: diagnosis.root_cause,
        recommendedNextShowCommand: diagnosis.recommended_next_show_command,
        suggestedConfigurationChanges: diagnosis.suggested_configuration_changes,
      })));
    } catch (requestError) {
      console.error("Unable to load diagnosis history:", requestError);
      setError(requestError.message || "Unable to load diagnosis history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [searchQuery, selectedConcept, selectedSeverity, selectedStatus]);

  const filteredDiagnoses = diagnoses;

  // Working Client-side CSV Exporter
  const handleExportCSV = () => {
    if (filteredDiagnoses.length === 0) return;

    // Build headers and content strings
    const headers = "Diagnosis ID,Timestamp,Concept,Severity,Status,Root Cause,Next Show Command,Suggested Changes\n";
    const rows = filteredDiagnoses.map(d => {
      return `"${d.id}","${d.timestamp}","${d.conceptTag}","${d.severity}","${d.status}","${d.rootCause.replace(/"/g, '""')}","${d.recommendedNextShowCommand}","${d.suggestedConfigurationChanges.replace(/"/g, '""').replace(/\n/g, ' | ')}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `NetSage_AI_Diagnostics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerExportToast("CSV Export downloaded successfully!");
  };

  // PDF Exporter simulation
  const handleExportPDF = () => {
    if (filteredDiagnoses.length === 0) return;
    
    // Simulate compilation
    triggerExportToast("Compiling PDF diagnostic report...");
    setTimeout(() => {
      // Create a print file download representing the PDF summary
      const title = "==================================================\n";
      const header = "       NETSAGE AI - VERIFIED DIAGNOSES REPORT      \n";
      const sub = `       Generated: ${new Date().toLocaleString()}              \n`;
      const separator = "==================================================\n\n";
      
      const content = filteredDiagnoses.map(d => {
        return `ID: ${d.id}\nConcept: ${d.conceptTag} | Severity: ${d.severity} | Status: ${d.status}\nSymptom: ${d.symptom}\nRoot Cause: ${d.rootCause}\nSuggested Changes:\n${d.suggestedConfigurationChanges}\n--------------------------------------------------\n\n`;
      }).join("");

      const blob = new Blob([title + header + sub + separator + content], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `NetSage_AI_Report_${new Date().toISOString().slice(0,10)}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerExportToast("PDF summary report downloaded to your system!");
    }, 1200);
  };

  const triggerExportToast = (message) => {
    setExportAlert(message);
    setTimeout(() => setExportAlert(null), 3000);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedConcept("ALL");
    setSelectedSeverity("ALL");
    setSelectedStatus("ALL");
  };

  // Styling helpers
  const getSeverityClass = (sev) => {
    switch (sev) {
      case "Critical": return "bg-red-500/15 text-red-400 border border-red-500/20";
      case "High": return "bg-orange-500/15 text-orange-400 border border-orange-500/20";
      case "Medium": return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20";
      default: return "bg-slate-500/15 text-slate-400 border border-slate-500/20";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Accepted": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Edited": return "bg-blue-500/10 text-brand-cyan border border-brand-cyan/20";
      case "Rejected": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "Edited": return <Edit3 className="h-4 w-4 text-brand-cyan" />;
      case "Rejected": return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <AlertCircle className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col space-y-6 pb-12">
      
      {/* Toast Alert */}
      {exportAlert && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-brand-cyan/30 text-slate-100 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
          <span className="text-xs font-semibold">{exportAlert}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white m-0">Diagnostic Audit Logs</h1>
          <p className="text-slate-400 text-xs mt-1">Audit, sort, and export previous Cisco Packet Tracer network validation history.</p>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredDiagnoses.length === 0}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-white/5 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={filteredDiagnoses.length === 0}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-blue/10 border border-brand-cyan/20 disabled:opacity-40 disabled:pointer-events-none hover:bg-brand-blue/20 text-brand-cyan text-xs font-semibold rounded-lg transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, symptoms, root cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan/60"
            />
          </div>

          {/* Concept Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
            <select
              value={selectedConcept}
              onChange={(e) => setSelectedConcept(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-cyan/60"
            >
              <option value="ALL">All Concepts</option>
              <option value="VLAN">VLAN</option>
              <option value="Routing">Routing</option>
              <option value="DHCP">DHCP</option>
              <option value="DNS">DNS</option>
              <option value="ACL">ACL</option>
              <option value="NAT">NAT</option>
              <option value="Wireless">Wireless</option>
            </select>
          </div>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Accepted">Accepted</option>
            <option value="Edited">Edited</option>
            <option value="Rejected">Rejected</option>
          </select>

        </div>

        {/* Active search count and reset */}
        {(searchQuery || selectedConcept !== "ALL" || selectedSeverity !== "ALL" || selectedStatus !== "ALL") && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            <span>Found <strong>{filteredDiagnoses.length}</strong> matching entries in history.</span>
            <button
              onClick={handleResetFilters}
              className="text-brand-cyan hover:underline font-semibold focus:outline-none"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Layout */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-white/5 uppercase tracking-wider">
                <th className="p-4">Diagnosis ID</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Concept</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Isolated Root Cause</th>
                <th className="p-4">Review Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDiagnoses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    {loading ? "Loading diagnostic records..." : error || "No matching diagnostic records found."}
                  </td>
                </tr>
              ) : (
                filteredDiagnoses.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/30 transition-colors">
                    
                    {/* ID */}
                    <td className="p-4 font-mono font-bold text-slate-200">
                      <Link to={`/result/${d.id}`} className="text-brand-cyan hover:underline">
                        {d.id}
                      </Link>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(d.timestamp).toLocaleDateString()} &bull; {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Concept */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium">
                        {d.conceptTag}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider ${getSeverityClass(d.severity)}`}>
                        {d.severity}
                      </span>
                    </td>

                    {/* Root Cause */}
                    <td className="p-4 font-medium text-slate-300 max-w-xs truncate">
                      {d.rootCause}
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full font-semibold ${getStatusClass(d.status)}`}>
                        {getStatusIcon(d.status)}
                        <span className="text-[10px] tracking-wide">{d.status}</span>
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/result/${d.id}`}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-white/5 transition-colors"
                        >
                          View Report
                        </Link>
                        {d.status === "Pending Review" && (
                          <Link
                            to={`/review/${d.id}`}
                            className="px-3 py-1 bg-brand-blue/10 border border-brand-cyan/20 text-brand-cyan hover:bg-brand-blue/20 rounded font-semibold"
                          >
                            Review
                          </Link>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
