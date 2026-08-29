import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { diagnoseNetwork } from "../services/api";
import { Terminal, Settings2, HelpCircle, FileText, Check, Cpu } from "lucide-react";

// Sample prefilled templates to make evaluation extremely easy and pleasant
const TEMPLATES = {
  VLAN: {
    symptom: "PC1 in VLAN 10 cannot ping PC2 in VLAN 99. The trunk link between switches S1 and S2 is active, but traffic is blocked.",
    commandOutput: `S1# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Fa0/24      on           802.1q         trunking      1

S2# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Fa0/24      on           802.1q         trunking      99`,
    notes: "Switch S1 and Switch S2 are connected via FastEthernet 0/24."
  },
  Routing: {
    symptom: "OSPF is configured on Router R1 and R2, but the routing tables do not show routes from the neighbor.",
    commandOutput: `R1# show ip ospf neighbor

R1# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.1.1.1/30, Area 0
  Timer intervals configured, Hello 10, Dead 40
  
R2# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.1.1.2/30, Area 0
  Timer intervals configured, Hello 10, Dead 30`,
    notes: "R1 and R2 are back-to-back routers on OSPF area 0."
  },
  DHCP: {
    symptom: "Host PC3 on VLAN 10 is not receiving a DHCP lease and defaults to 169.254.x.x APIPA. The DHCP Server is hosted on Router R1.",
    commandOutput: `R1# show ip dhcp pool
Pool LAN_POOL :
 Utilization mark is 100%
 IP address range     : 192.168.10.10 to 192.168.10.15
 Leased addresses     : 6
 Excluded addresses   : 2`,
    notes: "VLAN 10 is served by a DHCP pool on R1."
  },
  DNS: {
    symptom: "Web browsers on LAN client PCs cannot resolve internal domain 'cisco.local', but pinging the server by IP 10.10.10.5 works.",
    commandOutput: `R1# show ip dhcp pool
Pool OfficePool :
 dns-server 10.10.10.254
 default-router 10.10.10.1
 
R1# ping 10.10.10.254
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.10.254, timeout is 2 seconds:
..... (0/5 packets received)`,
    notes: "DNS server 10.10.10.254 appears to be offline or configured with a wrong IP."
  },
  ACL: {
    symptom: "PC1 cannot SSH (Port 22) into Router R1, but can ping the router interface. R1 should allow management SSH.",
    commandOutput: `R1# show access-lists
Standard IP access list 10
    10 permit 192.168.20.0 0.0.0.255 (20 matches)
    
R1# show running-config | section line vty
line vty 0 4
 access-class 10 in
 transport input ssh`,
    notes: "PC1 is at 192.168.1.55, which is outside the permitted management subnet 192.168.20.0/24."
  },
  NAT: {
    symptom: "Hosts inside the private network 192.168.100.0/24 cannot browse the internet. Router R1 is the boundary router.",
    commandOutput: `R1# show ip nat statistics
Total active translations: 0
Outside interfaces: GigabitEthernet0/0
Inside interfaces: GigabitEthernet0/1

R1# show running-config | include nat
ip nat pool MY_POOL 203.0.113.2 203.0.113.2 netmask 255.255.255.252
! Missing inside source list overloading statement`,
    notes: "NAT pool configured but dynamic mapping rule overload command was omitted."
  },
  Wireless: {
    symptom: "Laptop client cannot connect to corporate SSID 'Cisco-Corp'. WPA2 PSK authentication failed error appears on the client terminal.",
    commandOutput: `WLC# show wlan summary
WLAN ID  SSID         Status  Security
1        Cisco-Corp   UP      [WPA2][Auth=PSK][Key=Cisco123!]

Client terminal logs:
Wireless interface state: Scanning...
SSID Cisco-Corp found. Connecting with PSK 'cisco123!'...
Auth failed: WPA2 4-way handshake failed.`,
    notes: "Client is using lowercase 'cisco123!' but WLC is configured with Capital 'Cisco123!'."
  }
};

export default function DiagnosePage() {
  const navigate = useNavigate();

  // Form states
  const [symptom, setSymptom] = useState("");
  const [commandOutput, setCommandOutput] = useState("");
  const [topologyNotes, setTopologyNotes] = useState("");
  const [conceptTag, setConceptTag] = useState("VLAN");

  // Loading animation states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Reading CLI show command logs...",
    "Parsing topology notes and device contexts...",
    "Analyzing Packet Tracer variables...",
    "Running rule-based validations on 8 network check blocks...",
    "Correlating anomalies against the OSI Layer stack...",
    "Formulating suggested configuration changes..."
  ];

  const handleLoadTemplate = (tag) => {
    const temp = TEMPLATES[tag];
    if (temp) {
      setConceptTag(tag);
      setSymptom(temp.symptom);
      setCommandOutput(temp.commandOutput);
      setTopologyNotes(temp.notes);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptom || !commandOutput) return;

    setLoading(true);
    setLoadingStep(0);

    const interval = window.setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingMessages.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 450);

    try {
      const diagnosis = await diagnoseNetwork({
        symptom,
        show_command_output: commandOutput,
        topology_notes: topologyNotes || null,
        concept_tag: conceptTag,
      });

      navigate(`/result/${diagnosis.diagnosis_id}`);
    } catch (error) {
      console.error("Unable to analyze network symptoms:", error);
      window.alert(error.message || "Unable to analyze the network symptoms. Please try again.");
      setLoading(false);
    } finally {
      window.clearInterval(interval);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-12 max-w-2xl mx-auto w-full">
        
        {/* Pulsing Skeleton Box */}
        <div className="w-full glass-card border border-brand-cyan/20 p-8 rounded-2xl flex flex-col space-y-6 animate-pulse-slow">
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-cyan/15 rounded-xl flex items-center justify-center text-brand-cyan">
              <Cpu className="h-6 w-6 animate-spin" />
            </div>
            <div className="flex-grow space-y-2">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-2/3" />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
            <div className="h-3 bg-slate-800 rounded w-4/5" />
          </div>

          {/* Progress Logs */}
          <div className="p-4 bg-slate-950/80 border border-white/5 rounded-xl font-mono text-xs">
            <div className="text-slate-500 mb-2">[$] netsage-analyzer --diagnose --id=PENDING</div>
            
            {loadingMessages.map((msg, idx) => {
              const isActive = idx === loadingStep;
              const isPast = idx < loadingStep;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center space-x-2 py-0.5 transition-opacity duration-300 ${
                    isActive ? "text-brand-cyan" : isPast ? "text-slate-400" : "text-slate-600 opacity-30"
                  }`}
                >
                  {isPast ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  ) : isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping flex-shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                  )}
                  <span className={isActive ? "font-bold" : ""}>{msg}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-brand-cyan">
            <span>Analyzing Packet Tracer logs...</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      
      {/* Template Quick Selection */}
      <div className="lg:col-span-1 flex flex-col space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
            <Settings2 className="h-5 w-5 text-brand-cyan" />
            <span>Quick-Load Templates</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Select a network protocol concept to pre-fill the form with a simulated Cisco command defect case.
          </p>

          <div className="flex flex-col space-y-2">
            {Object.keys(TEMPLATES).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleLoadTemplate(tag)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-xs font-semibold border transition-all ${
                  conceptTag === tag
                    ? "bg-brand-blue/10 border-brand-cyan/40 text-brand-cyan"
                    : "bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-900/75 hover:border-slate-800"
                }`}
              >
                <span>{tag} Fault Template</span>
                {conceptTag === tag && <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-brand-purple/5 to-transparent">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <HelpCircle className="h-4 w-4 text-brand-purple" />
            <span>How to analyze?</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed space-y-2">
            This module accepts symptoms and CLI logs. Use show commands like:
            <code className="block mt-1 font-mono text-[10px] text-brand-cyan bg-slate-950 p-2 rounded">
              - show interfaces trunk<br />
              - show ip ospf neighbor<br />
              - show ip dhcp pool<br />
              - show access-lists<br />
              - show ip nat translations
            </code>
          </p>
        </div>
      </div>

      {/* Main Diagnose Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold text-white">Network Diagnostic Engine</h2>
            <p className="text-xs text-slate-400 mt-1">Identify faults, test commands, and recommend next actions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Concept dropdown */}
            <div className="md:col-span-1 flex flex-col space-y-2">
              <label htmlFor="concept" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Concept Tag
              </label>
              <select
                id="concept"
                value={conceptTag}
                onChange={(e) => setConceptTag(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan/60"
              >
                <option value="VLAN">VLAN</option>
                <option value="Routing">Routing</option>
                <option value="DHCP">DHCP</option>
                <option value="DNS">DNS</option>
                <option value="ACL">ACL</option>
                <option value="NAT">NAT</option>
                <option value="Wireless">Wireless</option>
              </select>
            </div>

            {/* Topology notes */}
            <div className="md:col-span-2 flex flex-col space-y-2">
              <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Topology Notes <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                id="notes"
                type="text"
                placeholder="e.g. S1 is distribution switch, PC1 is on VLAN 10..."
                value={topologyNotes}
                onChange={(e) => setTopologyNotes(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan/60"
              />
            </div>
          </div>

          {/* Network Symptoms */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="symptoms" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <span>Network Symptom</span>
              <span className="text-red-400">*</span>
            </label>
            <textarea
              id="symptoms"
              required
              rows={3}
              placeholder="Describe what connectivity is broken, error messages, or ping results..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan/60 font-sans"
            />
          </div>

          {/* Cisco Show commands output */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="commands" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <span>Cisco Show Command Output</span>
              <span className="text-red-400">*</span>
            </label>
            <textarea
              id="commands"
              required
              rows={8}
              placeholder="Paste CLI command logs here (e.g. show ip interface brief, show ip route, show vlan brief)..."
              value={commandOutput}
              onChange={(e) => setCommandOutput(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-lg p-3 text-xs text-brand-cyan placeholder-slate-700 focus:outline-none focus:border-brand-cyan/60 font-mono"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!symptom || !commandOutput}
              className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple disabled:opacity-30 disabled:pointer-events-none text-white font-semibold rounded-lg hover:brightness-110 shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/25 transition-all duration-300"
            >
              <Terminal className="h-4 w-4" />
              <span>Analyze Symptoms</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
