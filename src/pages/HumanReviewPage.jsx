import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DataService } from "../services/dataService";
import { submitHumanReview } from "../services/api";
import DiagnosisTimeline from "../components/DiagnosisTimeline";
import { UserCheck, ShieldCheck, XCircle, Edit3, ClipboardList, ArrowLeft, Save } from "lucide-react";

export default function HumanReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState(null);

  // Form review states
  const [action, setAction] = useState("Accept"); // Accept, Edit, Reject
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("Wrong configuration pattern");

  // Editable fields (active only when action === "Edit")
  const [rootCause, setRootCause] = useState("");
  const [nextShowCommand, setNextShowCommand] = useState("");
  const [suggestedChanges, setSuggestedChanges] = useState("");
  const [troubleshootingSteps, setTroubleshootingSteps] = useState("");

  const [notification, setNotification] = useState(false);

  useEffect(() => {
    const record = DataService.getDiagnosisById(id);
    if (record) {
      setDiagnosis(record);
      setReviewerNotes(record.reviewerNotes || "");
      
      // Seed editable states
      setRootCause(record.rootCause);
      setNextShowCommand(record.recommendedNextShowCommand);
      setSuggestedChanges(record.suggestedConfigurationChanges);
      setTroubleshootingSteps(
        record.stepByStepTroubleshootingGuide.map((step, idx) => `${idx + 1}. ${step}`).join("\n")
      );
    }
  }, [id]);

  if (!diagnosis) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white">Diagnosis Not Found</h2>
        <Link to="/dashboard" className="mt-4 inline-flex text-brand-cyan hover:underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const review = {
      diagnosis_id: diagnosis.id,
      action,
      reviewer_notes: reviewerNotes,
    };

    if (action === "Reject") {
      review.reviewer_notes = `[Rejection Reason: ${rejectionReason}] ${reviewerNotes}`.trim();
    } else if (action === "Edit") {
      review.root_cause = rootCause;
      review.recommended_next_show_command = nextShowCommand;
      review.suggested_configuration_changes = suggestedChanges;
      review.step_by_step_troubleshooting = troubleshootingSteps
        .split("\n")
        .map((step) => step.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);
    }

    try {
      const updatedReview = await submitHumanReview(review);

      setDiagnosis((currentDiagnosis) => ({
        ...currentDiagnosis,
        id: updatedReview.diagnosis_id,
        status: updatedReview.status,
        reviewerNotes: updatedReview.reviewer_notes ?? currentDiagnosis.reviewerNotes,
        rootCause: updatedReview.root_cause ?? currentDiagnosis.rootCause,
        recommendedNextShowCommand:
          updatedReview.recommended_next_show_command ?? currentDiagnosis.recommendedNextShowCommand,
        suggestedConfigurationChanges:
          updatedReview.suggested_configuration_changes ?? currentDiagnosis.suggestedConfigurationChanges,
        stepByStepTroubleshootingGuide:
          updatedReview.step_by_step_troubleshooting ?? currentDiagnosis.stepByStepTroubleshootingGuide,
      }));
      setReviewerNotes(updatedReview.reviewer_notes ?? reviewerNotes);

      setNotification(true);
      setTimeout(() => {
        setNotification(false);
        navigate(`/result/${updatedReview.diagnosis_id}`);
      }, 1500);
    } catch (requestError) {
      console.error("Unable to submit human review:", requestError);
      window.alert(requestError.message || "Unable to save the review. Please try again.");
    }
  };

  return (
    <div className="flex flex-col space-y-8 pb-12 max-w-4xl mx-auto w-full">
      
      {/* Alert Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400/30 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 animate-bounce">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <span className="font-bold block">Verified Diagnosis Saved!</span>
            <span className="text-[10px] opacity-90">History records updated successfully.</span>
          </div>
        </div>
      )}

      {/* Back to Results */}
      <div>
        <Link 
          to={`/result/${diagnosis.id}`} 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Diagnosis Result</span>
        </Link>
      </div>

      {/* Title block */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">Action Required</span>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2 mt-0.5">
            <span>Human Review Workspace:</span>
            <span className="text-brand-cyan font-mono">{diagnosis.id}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Review AI predictions and approve configurations for the network topology.</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-brand-purple/10 border border-brand-purple/20 text-purple-400 font-semibold uppercase tracking-wider font-mono">
          {diagnosis.conceptTag} Fault
        </span>
      </div>

      {/* Timeline tracker */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-4">Verification Flow</span>
        <DiagnosisTimeline currentStatus={diagnosis.status} />
      </div>

      {/* Main split dashboard review */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Side: Original Diagnostics overview (2 columns) */}
        <div className="md:col-span-2 flex flex-col space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              <span>Original Symptoms</span>
            </h3>
            
            <div className="bg-slate-950/50 p-3 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
              {diagnosis.symptom}
            </div>

            {diagnosis.topologyNotes && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Topology Notes:</span>
                <span className="text-[11px] text-slate-400 leading-normal italic">{diagnosis.topologyNotes}</span>
              </div>
            )}

            <div className="border-t border-white/5 pt-3">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">Cisco CLI Output Snippet:</span>
              <pre className="p-3 bg-slate-950/80 rounded-lg text-[10px] font-mono text-brand-cyan border border-white/5 max-h-40 overflow-y-auto leading-relaxed">
                {diagnosis.commandOutput}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Side: Human Action Review form (3 columns) */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col space-y-6">
            
            {/* Action Selectors Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Review Decision Action
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Accept tab */}
                <button
                  type="button"
                  onClick={() => setAction("Accept")}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    action === "Accept"
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5"
                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 mb-1" />
                  <span>Accept Fix</span>
                </button>

                {/* Edit tab */}
                <button
                  type="button"
                  onClick={() => setAction("Edit")}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    action === "Edit"
                      ? "bg-brand-blue/10 border-brand-cyan/50 text-brand-cyan shadow-md shadow-brand-cyan/5"
                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Edit3 className="h-5 w-5 mb-1" />
                  <span>Edit Details</span>
                </button>

                {/* Reject tab */}
                <button
                  type="button"
                  onClick={() => setAction("Reject")}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    action === "Reject"
                      ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-md shadow-red-500/5"
                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <XCircle className="h-5 w-5 mb-1" />
                  <span>Reject Fix</span>
                </button>
              </div>
            </div>

            {/* If Edit is Selected, show input overrides */}
            {action === "Edit" && (
              <div className="border-t border-white/5 pt-4 space-y-4 animate-pulse-slow">
                
                {/* Override Root Cause */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="editRoot" className="text-xs font-bold text-slate-300">
                    Edit Root Cause
                  </label>
                  <textarea
                    id="editRoot"
                    rows={2}
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan/60"
                  />
                </div>

                {/* Override Suggested Changes */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="editChanges" className="text-xs font-bold text-slate-300">
                    Edit Suggested Configuration Changes
                  </label>
                  <textarea
                    id="editChanges"
                    rows={3}
                    value={suggestedChanges}
                    onChange={(e) => setSuggestedChanges(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-brand-cyan focus:outline-none focus:border-brand-cyan/60"
                  />
                </div>

                {/* Override Next Show Command */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="editCmd" className="text-xs font-bold text-slate-300">
                    Edit Recommended Next Show Command
                  </label>
                  <input
                    id="editCmd"
                    type="text"
                    value={nextShowCommand}
                    onChange={(e) => setNextShowCommand(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-brand-cyan focus:outline-none focus:border-brand-cyan/60"
                  />
                </div>

                {/* Override Step-by-Step guide */}
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="editSteps" className="text-xs font-bold text-slate-300">
                    Edit Troubleshooting Steps <span className="text-slate-500 font-normal">(numbered list)</span>
                  </label>
                  <textarea
                    id="editSteps"
                    rows={4}
                    value={troubleshootingSteps}
                    onChange={(e) => setTroubleshootingSteps(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan/60 leading-relaxed"
                  />
                </div>

              </div>
            )}

            {/* If Reject is Selected, show rejection reason drop-down */}
            {action === "Reject" && (
              <div className="border-t border-white/5 pt-4 flex flex-col space-y-1.5">
                <label htmlFor="rejectReason" className="text-xs font-bold text-slate-300">
                  Rejection Classification Reason
                </label>
                <select
                  id="rejectReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan/60"
                >
                  <option value="Incorrect command syntax interpretation">Incorrect command syntax interpretation</option>
                  <option value="Wrong layer classification error">Wrong layer classification error</option>
                  <option value="Incorrect configuration suggested changes">Incorrect configuration suggested changes</option>
                  <option value="Failed checks validation false positive">Failed checks validation false positive</option>
                  <option value="Other topology logic errors">Other topology logic errors</option>
                </select>
              </div>
            )}

            {/* Reviewer Notes Text area */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="reviewNotes" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reviewer Notes / Rationale
              </label>
              <textarea
                id="reviewNotes"
                rows={3}
                placeholder="Include feedback or reasoning regarding your review decision for reference in audit logs..."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-cyan/60"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple text-white font-semibold rounded-lg hover:brightness-110 shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/25 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Submit Verified Diagnosis</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
