# Responsible AI Review Log

These records document mandatory human oversight for known cases in `cases.csv`. They describe corrections to deterministic initial diagnoses; they do not represent a trained ML model.

## VLAN-002

- **AI diagnosis:** Trunking may be disabled or the native VLAN may be incorrect.
- **Human decision:** Edited
- **Human correction:** Confirmed a native VLAN mismatch: S1 Gi0/1 uses VLAN 1 and S2 Gi0/1 uses VLAN 99.
- **Reason for correction:** The CDP mismatch message directly identifies both native VLAN values; there is no evidence that trunking is disabled.

## DHCP-003

- **AI diagnosis:** DHCP pool exhaustion or a missing relay helper may be preventing connectivity.
- **Human decision:** Edited
- **Human correction:** The DHCP pool advertises `default-router 192.168.4.1` while Gi0/1 is `192.168.40.1`; correct the DHCP default-router option.
- **Reason for correction:** The output shows a gateway-address mismatch, not pool exhaustion or a relay failure.

## ROUTING-003

- **AI diagnosis:** OSPF hello/dead timer mismatch.
- **Human decision:** Edited
- **Human correction:** Align Gi0/1 MTU values before rebuilding the OSPF adjacency.
- **Reason for correction:** Both routers show the same hello/dead timers in the case, while the output proves MTU 1500 on R1 and 1400 on R2.

## ACL-003

- **AI diagnosis:** A VTY access-class is blocking SSH management traffic.
- **Human decision:** Edited
- **Human correction:** Permit the required DHCP relay UDP traffic and remove or narrow the rule denying UDP port 67.
- **Reason for correction:** ACL 110 is applied inbound and explicitly denies UDP destination port 67; the evidence concerns DHCP relay, not VTY SSH access.

## WIRELESS-003

- **AI diagnosis:** WPA2 pre-shared-key mismatch.
- **Human decision:** Rejected
- **Human correction:** No configuration change accepted; verify and enable WLAN 10 before investigating client authentication.
- **Reason for correction:** The controller output explicitly reports `Branch-WiFi DISABLED`; no client authentication or PSK evidence is supplied.
