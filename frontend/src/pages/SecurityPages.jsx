import React from "react";

const activities = [
  {
    id: 1,
    user: "admin",
    type: "LOGIN",
    resource: "System",
    device: "Admin-Laptop",
    ip: "192.168.1.10",
    time: "10:42 AM",
    risk: 10,
    status: "NORMAL",
  },
  {
    id: 2,
    user: "employee1",
    type: "FILE_ACCESS",
    resource: "Financial_Report.pdf",
    device: "Employee-PC-01",
    ip: "192.168.1.21",
    time: "10:35 AM",
    risk: 35,
    status: "NORMAL",
  },
  {
    id: 3,
    user: "employee2",
    type: "FAILED_LOGIN",
    resource: "Authentication",
    device: "Unknown Device",
    ip: "172.16.10.45",
    time: "10:21 AM",
    risk: 55,
    status: "SUSPICIOUS",
  },
  {
    id: 4,
    user: "employee1",
    type: "DATA_EXPORT",
    resource: "Customer_Database",
    device: "Employee-PC-01",
    ip: "192.168.1.21",
    time: "09:58 AM",
    risk: 85,
    status: "HIGH RISK",
  },
  {
    id: 5,
    user: "employee2",
    type: "FILE_ACCESS",
    resource: "Payroll.xlsx",
    device: "Unknown Device",
    ip: "172.16.10.45",
    time: "09:45 AM",
    risk: 92,
    status: "CRITICAL",
  },
];

const threats = [
  {
    id: "THR-001",
    title: "Low Risk Login",
    user: "admin",
    severity: "LOW",
    score: 10,
    status: "RESOLVED",
  },
  {
    id: "THR-002",
    title: "Large Data Export",
    user: "employee1",
    severity: "HIGH",
    score: 85,
    status: "UNDER INVESTIGATION",
  },
  {
    id: "THR-003",
    title: "Suspicious File Access",
    user: "employee2",
    severity: "CRITICAL",
    score: 92,
    status: "OPEN",
  },
];

const investigations = [
  {
    id: "INV-001",
    threat: "Large Data Export",
    user: "employee1",
    analyst: "Security Analyst",
    priority: "HIGH",
    status: "UNDER INVESTIGATION",
  },
  {
    id: "INV-002",
    threat: "Suspicious File Access",
    user: "employee2",
    analyst: "Security Analyst",
    priority: "CRITICAL",
    status: "OPEN",
  },
];

const auditLogs = [
  {
    id: 1,
    actor: "admin",
    action: "LOGIN",
    target: "SentinelFlow",
    time: "10:42 AM",
    result: "SUCCESS",
  },
  {
    id: 2,
    actor: "Security Analyst",
    action: "ALERT_CREATED",
    target: "THR-003",
    time: "10:23 AM",
    result: "SUCCESS",
  },
  {
    id: 3,
    actor: "Security Analyst",
    action: "INVESTIGATION_STARTED",
    target: "INV-002",
    time: "10:25 AM",
    result: "SUCCESS",
  },
  {
    id: 4,
    actor: "admin",
    action: "POLICY_UPDATE",
    target: "Data Export Policy",
    time: "09:40 AM",
    result: "SUCCESS",
  },
];

const badgeStyle = (value) => {
  const colors = {
    LOW: "#10b981",
    MEDIUM: "#f59e0b",
    HIGH: "#f97316",
    CRITICAL: "#ef4444",
    OPEN: "#3b82f6",
    RESOLVED: "#10b981",
    "UNDER INVESTIGATION": "#f59e0b",
    NORMAL: "#10b981",
    SUSPICIOUS: "#f59e0b",
    "HIGH RISK": "#f97316",
    SUCCESS: "#10b981",
  };

  return {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    color: colors[value] || "#94a3b8",
    background: `${colors[value] || "#64748b"}22`,
    border: `1px solid ${colors[value] || "#64748b"}55`,
  };
};

const pageStyle = {
  minHeight: "100vh",
  background: "#080d1c",
  color: "#f8fafc",
  padding: "30px",
};

const cardStyle = {
  background: "#111a2d",
  border: "1px solid #233252",
  borderRadius: "12px",
  padding: "22px",
  marginBottom: "22px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "14px",
  background: "#0b1222",
  color: "#94a3b8",
  fontSize: "13px",
};

const tdStyle = {
  padding: "14px",
  borderTop: "1px solid #233252",
  fontSize: "14px",
};

function Header({ title }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "28px" }}>{title}</h1>
        <p style={{ color: "#94a3b8", marginTop: "7px" }}>
          SentinelFlow Security Operations Center
        </p>
      </div>

      <div
        style={{
          padding: "10px 16px",
          background: "#17223a",
          borderRadius: "8px",
          color: "#60a5fa",
        }}
      >
        ● SYSTEM ONLINE
      </div>
    </div>
  );
}

/* ================= ACTIVITIES ================= */

export function Activities() {
  return (
    <div style={pageStyle}>
      <Header title="Activity Monitoring" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <Stat title="Total Activities" value="5" />
        <Stat title="Normal" value="2" />
        <Stat title="Suspicious" value="1" />
        <Stat title="High Risk" value="2" />
      </div>

      <div style={cardStyle}>
        <h2>Employee Activity Logs</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>USER</th>
              <th style={thStyle}>ACTIVITY</th>
              <th style={thStyle}>RESOURCE</th>
              <th style={thStyle}>DEVICE</th>
              <th style={thStyle}>IP ADDRESS</th>
              <th style={thStyle}>TIME</th>
              <th style={thStyle}>RISK</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td style={tdStyle}>{a.user}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle("MEDIUM")}>{a.type}</span>
                </td>
                <td style={tdStyle}>{a.resource}</td>
                <td style={tdStyle}>{a.device}</td>
                <td style={tdStyle}>{a.ip}</td>
                <td style={tdStyle}>{a.time}</td>
                <td style={tdStyle}>
                  <strong
                    style={{
                      color:
                        a.risk >= 80
                          ? "#ef4444"
                          : a.risk >= 60
                          ? "#f97316"
                          : a.risk >= 30
                          ? "#f59e0b"
                          : "#10b981",
                    }}
                  >
                    {a.risk}
                  </strong>
                </td>
                <td style={tdStyle}>
                  <span style={badgeStyle(a.status)}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <h2>Risk Scoring Engine</h2>
        <p style={{ color: "#94a3b8" }}>
          SentinelFlow calculates an explainable risk score between 0 and 100
          based on suspicious activities, access patterns, device trust and
          policy violations.
        </p>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <span style={badgeStyle("LOW")}>0–29 LOW</span>
          <span style={badgeStyle("MEDIUM")}>30–59 MEDIUM</span>
          <span style={badgeStyle("HIGH")}>60–79 HIGH</span>
          <span style={badgeStyle("CRITICAL")}>80–100 CRITICAL</span>
        </div>
      </div>
    </div>
  );
}

/* ================= THREATS ================= */

export function Threats() {
  return (
    <div style={pageStyle}>
      <Header title="Threat Detection & Alerts" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <Stat title="Total Threats" value="3" />
        <Stat title="Open" value="1" />
        <Stat title="Under Investigation" value="1" />
        <Stat title="Resolved" value="1" />
      </div>

      <div style={cardStyle}>
        <h2>Detected Threats</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>THREAT ID</th>
              <th style={thStyle}>THREAT</th>
              <th style={thStyle}>USER</th>
              <th style={thStyle}>SEVERITY</th>
              <th style={thStyle}>RISK SCORE</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {threats.map((t) => (
              <tr key={t.id}>
                <td style={tdStyle}>{t.id}</td>
                <td style={tdStyle}>{t.title}</td>
                <td style={tdStyle}>{t.user}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle(t.severity)}>{t.severity}</span>
                </td>
                <td style={tdStyle}>
                  <strong>{t.score}/100</strong>
                </td>
                <td style={tdStyle}>
                  <span style={badgeStyle(t.status)}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <h2>Detection Rules</h2>

        <ul style={{ color: "#cbd5e1", lineHeight: "2" }}>
          <li>Multiple failed login attempts</li>
          <li>Unusual login time</li>
          <li>Access from unknown device</li>
          <li>Large data export</li>
          <li>Access to sensitive resources</li>
          <li>Abnormally high activity volume</li>
        </ul>
      </div>
    </div>
  );
}

/* ================= INVESTIGATIONS ================= */

export function Investigations() {
  return (
    <div style={pageStyle}>
      <Header title="Investigation Center" />

      <div style={cardStyle}>
        <h2>Active Investigations</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>CASE ID</th>
              <th style={thStyle}>THREAT</th>
              <th style={thStyle}>USER</th>
              <th style={thStyle}>ANALYST</th>
              <th style={thStyle}>PRIORITY</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {investigations.map((i) => (
              <tr key={i.id}>
                <td style={tdStyle}>{i.id}</td>
                <td style={tdStyle}>{i.threat}</td>
                <td style={tdStyle}>{i.user}</td>
                <td style={tdStyle}>{i.analyst}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle(i.priority)}>{i.priority}</span>
                </td>
                <td style={tdStyle}>
                  <span style={badgeStyle(i.status)}>{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <h2>Investigation Workflow</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {[
            "Alert Generated",
            "Case Created",
            "Evidence Reviewed",
            "Risk Evaluated",
            "Action Taken",
            "Case Closed",
          ].map((step, index) => (
            <React.Fragment key={step}>
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: "#17223a",
                  border: "1px solid #33466b",
                  color: "#60a5fa",
                }}
              >
                {index + 1}. {step}
              </div>

              {index < 5 && <span>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= REPORTS ================= */

export function Reports() {
  return (
    <div style={pageStyle}>
      <Header title="Security Reports & Analytics" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        <Stat title="Activities Analyzed" value="1,248" />
        <Stat title="Threats Detected" value="27" />
        <Stat title="Average Risk Score" value="38/100" />
      </div>

      <div style={cardStyle}>
        <h2>Risk Distribution</h2>

        {[
          ["LOW", 64],
          ["MEDIUM", 21],
          ["HIGH", 10],
          ["CRITICAL", 5],
        ].map(([label, value]) => (
          <div key={label} style={{ marginBottom: "18px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span>{label}</span>
              <span>{value}%</span>
            </div>

            <div
              style={{
                height: "12px",
                background: "#1e293b",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${value}%`,
                  height: "100%",
                  background:
                    label === "CRITICAL"
                      ? "#ef4444"
                      : label === "HIGH"
                      ? "#f97316"
                      : label === "MEDIUM"
                      ? "#f59e0b"
                      : "#10b981",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h2>Generated Reports</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>REPORT</th>
              <th style={thStyle}>TYPE</th>
              <th style={thStyle}>PERIOD</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={tdStyle}>Daily Security Summary</td>
              <td style={tdStyle}>Security Analytics</td>
              <td style={tdStyle}>10 Oct 2026</td>
              <td style={tdStyle}>
                <span style={badgeStyle("RESOLVED")}>GENERATED</span>
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>Insider Threat Report</td>
              <td style={tdStyle}>Threat Analysis</td>
              <td style={tdStyle}>October 2026</td>
              <td style={tdStyle}>
                <span style={badgeStyle("RESOLVED")}>GENERATED</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= AUDIT LOG ================= */

export function AuditLogs() {
  return (
    <div style={pageStyle}>
      <Header title="Audit Log Management" />

      <div style={cardStyle}>
        <h2>System Audit Trail</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>ACTOR</th>
              <th style={thStyle}>ACTION</th>
              <th style={thStyle}>TARGET</th>
              <th style={thStyle}>TIME</th>
              <th style={thStyle}>RESULT</th>
            </tr>
          </thead>

          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td style={tdStyle}>{log.id}</td>
                <td style={tdStyle}>{log.actor}</td>
                <td style={tdStyle}>{log.action}</td>
                <td style={tdStyle}>{log.target}</td>
                <td style={tdStyle}>{log.time}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle(log.result)}>{log.result}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= STAT ================= */

function Stat({ title, value }) {
  return (
    <div
      style={{
        background: "#111a2d",
        border: "1px solid #233252",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div style={{ color: "#94a3b8", marginBottom: "10px" }}>{title}</div>
      <div style={{ fontSize: "30px", fontWeight: "700" }}>{value}</div>
    </div>
  );
}