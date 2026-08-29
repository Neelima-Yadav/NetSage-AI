import React from "react";
import { Server, Activity, Sliders, Cpu, ArrowUpDown, Network, Layers } from "lucide-react";

export default function OSILayerVisualizer({ highlightedLayer = 3 }) {
  const osiLayers = [
    { number: 7, name: "Application", protocols: "DHCP, DNS, HTTP, SSH", icon: Server, desc: "Network services to applications" },
    { number: 6, name: "Presentation", protocols: "SSL/TLS, ASCII, Encryption", icon: Sliders, desc: "Data representation & encryption" },
    { number: 5, name: "Session", protocols: "NetBIOS, RPC, Sockets", icon: Activity, desc: "Interhost communication management" },
    { number: 4, name: "Transport", protocols: "TCP, UDP, ACL Port rules", icon: ArrowUpDown, desc: "End-to-end connections & reliability" },
    { number: 3, name: "Network", protocols: "IP, OSPF, NAT, ICMP, Routing", icon: Network, desc: "Path determination & IP routing" },
    { number: 2, name: "Data Link", protocols: "Ethernet, VLANs, MAC, Wireless", icon: Layers, desc: "Physical addressing & LAN switching" },
    { number: 1, name: "Physical", protocols: "Cables, RJ45, Bits, Interfaces", icon: Cpu, desc: "Media, signal, and binary transmission" },
  ];

  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 flex items-center space-x-2">
          <Layers className="h-4 w-4 text-brand-cyan" />
          <span>OSI Layer Visualizer</span>
        </h3>
        <span className="text-xs px-2 py-0.5 rounded bg-brand-blue/15 border border-brand-cyan/20 text-brand-cyan font-mono">
          Layer {highlightedLayer} Affected
        </span>
      </div>

      <div className="flex flex-col space-y-1.5">
        {osiLayers.map((layer) => {
          const isHighlighted = layer.number === highlightedLayer;
          const Icon = layer.icon;

          return (
            <div
              key={layer.number}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                isHighlighted
                  ? "bg-gradient-to-r from-brand-blue/20 via-brand-purple/10 to-transparent border-brand-cyan/50 shadow-md shadow-brand-cyan/10 scale-[1.01] translate-x-1"
                  : "bg-slate-900/30 border-white/5 opacity-40 hover:opacity-70"
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Layer Number Icon */}
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm ${
                    isHighlighted 
                      ? "bg-brand-cyan text-slate-950" 
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  L{layer.number}
                </div>

                <div>
                  <h4 className={`text-sm font-semibold ${isHighlighted ? "text-brand-cyan" : "text-slate-300"}`}>
                    {layer.name} Layer
                  </h4>
                  <span className="text-[11px] text-slate-400 block max-w-[200px] sm:max-w-md truncate">
                    {layer.desc}
                  </span>
                </div>
              </div>

              {/* Protocol Tags */}
              <div className="text-right flex flex-col items-end space-y-0.5">
                <span className={`text-xs font-mono font-medium ${isHighlighted ? "text-purple-300" : "text-slate-500"}`}>
                  {layer.protocols}
                </span>
                {isHighlighted && (
                  <span className="text-[9px] uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan px-1.5 py-0.5 rounded font-bold">
                    FAULT ZONE
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
