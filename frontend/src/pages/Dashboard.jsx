import React, { useEffect, useState } from "react";
import { dashboardAPI } from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const response =
        await dashboardAPI.getSummary();

      setData(response.data);
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(
      loadDashboard,
      5000
    );

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080d19",
          color: "#e5e7eb",
          padding: "40px",
        }}
      >
        <h1>SentinelFlow Dashboard</h1>
        <p>Loading security data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080d19",
          color: "#e5e7eb",
          padding: "40px",
        }}
      >
        <h1>SentinelFlow Dashboard</h1>

        <p style={{ color: "#ef4444" }}>
          Unable to load dashboard data.
        </p>
      </div>
    );
  }

  const summary = data.summary || {};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d19",
        color: "#e5e7eb",
        padding: "30px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: "5px",
            }}
          >
            SentinelFlow
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: 0,
            }}
          >
            Intelligent Insider Threat
            Detection & Risk Analysis
          </p>
        </div>

        <div
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#0f2a20",
            color: "#22c55e",
            fontWeight: "700",
            border:
              "1px solid #166534",
          }}
        >
          ● SYSTEM OPERATIONAL
        </div>
      </div>

      {/* STAT CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "18px",
          marginTop: "30px",
        }}
      >
        <StatCard
          title="Activities Analyzed"
          value={
            summary.totalActivities || 0
          }
          color="#3b82f6"
        />

        <StatCard
          title="Threats Detected"
          value={
            summary.totalThreats || 0
          }
          color="#ef4444"
        />

        <StatCard
          title="Open Threats"
          value={
            summary.openThreats || 0
          }
          color="#f97316"
        />

        <StatCard
          title="Average Risk"
          value={`${
            summary.averageRiskScore || 0
          }/100`}
          color="#eab308"
        />
      </div>

      {/* SECOND ROW */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "18px",
          marginTop: "18px",
        }}
      >
        <StatCard
          title="Critical Threats"
          value={
            summary.criticalThreats || 0
          }
          color="#dc2626"
        />

        <StatCard
          title="Active Investigations"
          value={
            summary.activeInvestigations || 0
          }
          color="#a855f7"
        />

        <StatCard
          title="Resolved Investigations"
          value={
            summary.resolvedInvestigations || 0
          }
          color="#22c55e"
        />
      </div>

      {/* RECENT ACTIVITY */}

      <div
        style={{
          marginTop: "30px",
          background: "#131d31",
          border:
            "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h2>Recent Activity</h2>

        {!data.recentActivities ||
        data.recentActivities.length ===
          0 ? (
          <p
            style={{
              color: "#94a3b8",
            }}
          >
            No activities recorded yet.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={th}>
                    User
                  </th>

                  <th style={th}>
                    Activity
                  </th>

                  <th style={th}>
                    Resource
                  </th>

                  <th style={th}>
                    Risk
                  </th>

                  <th style={th}>
                    Level
                  </th>

                  <th style={th}>
                    Status
                  </th>

                  <th style={th}>
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.recentActivities.map(
                  (activity) => (
                    <tr
                      key={
                        activity.id
                      }
                    >
                      <td style={td}>
                        {
                          activity.username
                        }
                      </td>

                      <td style={td}>
                        {
                          activity.activity_type
                        }
                      </td>

                      <td style={td}>
                        {
                          activity.resource ||
                          "-"
                        }
                      </td>

                      <td
                        style={{
                          ...td,
                          fontWeight:
                            "700",
                        }}
                      >
                        {
                          activity.risk_score
                        }
                      </td>

                      <td style={td}>
                        <RiskBadge
                          level={
                            activity.risk_level
                          }
                        />
                      </td>

                      <td style={td}>
                        {
                          activity.status
                        }
                      </td>

                      <td style={td}>
                        {new Date(
                          activity.created_at
                        ).toLocaleString()}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT THREATS */}

      <div
        style={{
          marginTop: "25px",
          background: "#131d31",
          border:
            "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h2>Recent Threat Alerts</h2>

        {!data.recentThreats ||
        data.recentThreats.length ===
          0 ? (
          <p
            style={{
              color: "#94a3b8",
            }}
          >
            No threats detected.
          </p>
        ) : (
          data.recentThreats.map(
            (threat) => (
              <div
                key={threat.id}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  padding:
                    "16px 0",
                  borderBottom:
                    "1px solid #26344d",
                }}
              >
                <div>
                  <strong>
                    {
                      threat.threat_type
                    }
                  </strong>

                  <div
                    style={{
                      color:
                        "#94a3b8",
                      marginTop:
                        "5px",
                    }}
                  >
                    User:{" "}
                    {
                      threat.username
                    }
                    {" • "}
                    Risk:{" "}
                    {
                      threat.risk_score
                    }
                  </div>
                </div>

                <div
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  <RiskBadge
                    level={
                      threat.severity
                    }
                  />

                  <div
                    style={{
                      color:
                        "#94a3b8",
                      fontSize:
                        "12px",
                      marginTop:
                        "5px",
                    }}
                  >
                    {
                      threat.status
                    }
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* SYSTEM WORKFLOW */}

      <div
        style={{
          marginTop: "25px",
          background: "#131d31",
          border:
            "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h2>SentinelFlow Detection Pipeline</h2>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          {[
            "Authentication",
            "Activity Monitoring",
            "Risk Analysis",
            "Threat Detection",
            "Alert Generation",
            "Investigation",
            "Resolution",
          ].map((step, index) => (
            <React.Fragment key={step}>
              <div
                style={{
                  background:
                    "#0d1628",
                  border:
                    "1px solid #334155",
                  borderRadius:
                    "8px",
                  padding:
                    "12px 15px",
                  textAlign:
                    "center",
                  fontSize:
                    "13px",
                }}
              >
                {step}
              </div>

              {index < 6 && (
                <span
                  style={{
                    color:
                      "#3b82f6",
                    fontSize:
                      "20px",
                  }}
                >
                  →
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        background: "#131d31",
        border:
          "1px solid #26344d",
        borderRadius: "12px",
        padding: "22px",
        borderLeft:
          `4px solid ${color}`,
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: "14px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "800",
          marginTop: "10px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  let color = "#22c55e";

  if (level === "CRITICAL") {
    color = "#ef4444";
  } else if (level === "HIGH") {
    color = "#f97316";
  } else if (level === "MEDIUM") {
    color = "#eab308";
  }

  return (
    <span
      style={{
        color,
        fontWeight: "700",
      }}
    >
      {level || "LOW"}
    </span>
  );
}

const th = {
  textAlign: "left",
  padding: "14px",
  borderBottom:
    "1px solid #26344d",
  color: "#60a5fa",
  fontSize: "12px",
};

const td = {
  padding: "14px",
  borderBottom:
    "1px solid #1e293b",
};