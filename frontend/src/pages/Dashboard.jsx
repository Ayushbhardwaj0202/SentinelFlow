import React, { useEffect, useMemo, useState } from "react";
import {
  dashboardAPI,
  activitiesAPI,
  threatsAPI,
} from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [dashboardResponse, activitiesResponse, threatsResponse] =
        await Promise.all([
          dashboardAPI.getSummary(),
          activitiesAPI.getAll(),
          threatsAPI.getAll(),
        ]);

      setData(dashboardResponse.data);

      const activityData = Array.isArray(activitiesResponse.data)
        ? activitiesResponse.data
        : activitiesResponse.data?.activities ||
          activitiesResponse.data?.data ||
          [];

      const threatData = Array.isArray(threatsResponse.data)
        ? threatsResponse.data
        : threatsResponse.data?.threats ||
          threatsResponse.data?.data ||
          [];

      setActivities(activityData);
      setThreats(threatData);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(loadDashboard, 5000);

    return () => clearInterval(timer);
  }, []);

  const mlMetrics = useMemo(() => {
    const total = activities.length;

    const mlAnomalies = activities.filter(
      (activity) =>
        activity.ml_anomaly === true ||
        activity.ml_anomaly === "true" ||
        activity.ml_anomaly === 1
    ).length;

    const hybridDetections = activities.filter(
      (activity) =>
        activity.detection_method === "HYBRID_RULE_ML"
    ).length;

    const ruleOnlyDetections = activities.filter(
      (activity) =>
        activity.detection_method === "RULE_ENGINE"
    ).length;

    const mlScores = activities
      .map((activity) => Number(activity.ml_anomaly_score))
      .filter((score) => Number.isFinite(score));

    const hybridScores = activities
      .map((activity) => Number(activity.hybrid_risk_score))
      .filter((score) => Number.isFinite(score));

    const averageMLScore =
      mlScores.length > 0
        ? (
            (mlScores.reduce((sum, score) => sum + score, 0) /
              mlScores.length) *
            100
          ).toFixed(1)
        : "0.0";

    const averageHybridRisk =
      hybridScores.length > 0
        ? (
            hybridScores.reduce(
              (sum, score) => sum + score,
              0
            ) / hybridScores.length
          ).toFixed(1)
        : "0.0";

    const anomalyRate =
      total > 0
        ? ((mlAnomalies / total) * 100).toFixed(1)
        : "0.0";

    const mlThreats = threats.filter(
      (threat) =>
        threat.detection_method === "HYBRID_RULE_ML" ||
        Number(threat.ml_anomaly_score) > 0
    ).length;

    return {
      total,
      mlAnomalies,
      hybridDetections,
      ruleOnlyDetections,
      averageMLScore,
      averageHybridRisk,
      anomalyRate,
      mlThreats,
    };
  }, [activities, threats]);

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

  const recentActivities =
    data.recentActivities || activities.slice(0, 10);

  const recentThreats =
    data.recentThreats || threats.slice(0, 10);

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
          justifyContent: "space-between",
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
            Intelligent Insider Threat Detection & Risk Analysis
          </p>
        </div>

        <div
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#0f2a20",
            color: "#22c55e",
            fontWeight: "700",
            border: "1px solid #166534",
          }}
        >
          ● SYSTEM OPERATIONAL
        </div>
      </div>

      {/* MAIN STAT CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "18px",
          marginTop: "30px",
        }}
      >
        <StatCard
          title="Activities Analyzed"
          value={summary.totalActivities || activities.length || 0}
          color="#3b82f6"
        />

        <StatCard
          title="Threats Detected"
          value={summary.totalThreats || threats.length || 0}
          color="#ef4444"
        />

        <StatCard
          title="Open Threats"
          value={summary.openThreats || 0}
          color="#f97316"
        />

        <StatCard
          title="Average Risk"
          value={`${summary.averageRiskScore || 0}/100`}
          color="#eab308"
        />
      </div>

      {/* SECURITY STAT CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "18px",
          marginTop: "18px",
        }}
      >
        <StatCard
          title="Critical Threats"
          value={summary.criticalThreats || 0}
          color="#dc2626"
        />

        <StatCard
          title="Active Investigations"
          value={summary.activeInvestigations || 0}
          color="#a855f7"
        />

        <StatCard
          title="Resolved Investigations"
          value={summary.resolvedInvestigations || 0}
          color="#22c55e"
        />

        <StatCard
          title="ML Anomalies"
          value={mlMetrics.mlAnomalies}
          color="#06b6d4"
        />
      </div>

      {/* ML ANALYTICS */}

      <div
        style={{
          marginTop: "30px",
          background: "#131d31",
          border: "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h2 style={{ marginTop: 0 }}>
              Machine Learning Security Analytics
            </h2>

            <p
              style={{
                color: "#94a3b8",
                marginBottom: 0,
              }}
            >
              Isolation Forest anomaly detection integrated with the
              SentinelFlow hybrid risk engine.
            </p>
          </div>

          <div
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              background: "#0b2233",
              border: "1px solid #075985",
              color: "#38bdf8",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            ISOLATION FOREST
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
            marginTop: "22px",
          }}
        >
          <MetricBox
            title="ML Anomalies"
            value={mlMetrics.mlAnomalies}
            subtitle={`${mlMetrics.anomalyRate}% anomaly rate`}
          />

          <MetricBox
            title="Hybrid Detections"
            value={mlMetrics.hybridDetections}
            subtitle="Rule + ML"
          />

          <MetricBox
            title="Average ML Score"
            value={`${mlMetrics.averageMLScore}%`}
            subtitle="Anomaly score"
          />

          <MetricBox
            title="ML-Assisted Threats"
            value={mlMetrics.mlThreats}
            subtitle="Threat alerts"
          />
        </div>

        {/* DETECTION BREAKDOWN */}

        <div
          style={{
            marginTop: "22px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          <div
            style={{
              background: "#0d1628",
              border: "1px solid #26344d",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Detection Method Breakdown
            </h3>

            <DetectionRow
              label="Hybrid Rule + ML"
              value={mlMetrics.hybridDetections}
              total={activities.length}
            />

            <DetectionRow
              label="Rule Engine Only"
              value={mlMetrics.ruleOnlyDetections}
              total={activities.length}
            />

            <DetectionRow
              label="ML Anomalies"
              value={mlMetrics.mlAnomalies}
              total={activities.length}
            />
          </div>

          <div
            style={{
              background: "#0d1628",
              border: "1px solid #26344d",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Hybrid Risk Engine
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <PipelineBox text="Rule Risk" />

              <span style={{ color: "#3b82f6", fontSize: "20px" }}>
                +
              </span>

              <PipelineBox text="Isolation Forest" />

              <span style={{ color: "#3b82f6", fontSize: "20px" }}>
                →
              </span>

              <PipelineBox text="Hybrid Risk" />
            </div>

            <div
              style={{
                marginTop: "18px",
                color: "#94a3b8",
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              Current hybrid risk combines the explainable rule-based
              score with the ML anomaly signal to generate the final
              threat risk used by SentinelFlow.
            </div>

            <div
              style={{
                marginTop: "14px",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              Average Hybrid Risk:{" "}
              <span style={{ color: "#facc15" }}>
                {mlMetrics.averageHybridRisk}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}

      <div
        style={{
          marginTop: "30px",
          background: "#131d31",
          border: "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h2>Recent Activity</h2>

        {!recentActivities || recentActivities.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No activities recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={th}>User</th>
                  <th style={th}>Activity</th>
                  <th style={th}>Resource</th>
                  <th style={th}>Risk</th>
                  <th style={th}>ML</th>
                  <th style={th}>Hybrid</th>
                  <th style={th}>Level</th>
                  <th style={th}>Time</th>
                </tr>
              </thead>

              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td style={td}>
                      {activity.username || "-"}
                    </td>

                    <td style={td}>
                      {activity.activity_type || "-"}
                    </td>

                    <td style={td}>
                      {activity.resource || "-"}
                    </td>

                    <td
                      style={{
                        ...td,
                        fontWeight: "700",
                      }}
                    >
                      {activity.risk_score ?? "-"}
                    </td>

                    <td style={td}>
                      {activity.ml_anomaly ? (
                        <span
                          style={{
                            color: "#ef4444",
                            fontWeight: "800",
                          }}
                        >
                          ANOMALY
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#22c55e",
                            fontWeight: "700",
                          }}
                        >
                          NORMAL
                        </span>
                      )}
                    </td>

                    <td
                      style={{
                        ...td,
                        fontWeight: "800",
                        color:
                          Number(activity.hybrid_risk_score) >= 80
                            ? "#ef4444"
                            : Number(activity.hybrid_risk_score) >= 60
                            ? "#f97316"
                            : Number(activity.hybrid_risk_score) >= 30
                            ? "#eab308"
                            : "#22c55e",
                      }}
                    >
                      {activity.hybrid_risk_score ?? "-"}
                    </td>

                    <td style={td}>
                      <RiskBadge
                        level={
                          activity.risk_level ||
                          activity.hybrid_risk_level
                        }
                      />
                    </td>

                    <td style={td}>
                      {activity.created_at
                        ? new Date(
                            activity.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
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
          border: "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h2>Recent Threat Alerts</h2>

        {!recentThreats || recentThreats.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No threats detected.
          </p>
        ) : (
          recentThreats.map((threat) => (
            <div
              key={threat.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 0",
                borderBottom: "1px solid #26344d",
              }}
            >
              <div>
                <strong>
                  {threat.threat_type || "Suspicious Activity"}
                </strong>

                <div
                  style={{
                    color: "#94a3b8",
                    marginTop: "5px",
                  }}
                >
                  User: {threat.username || "-"}
                  {" • "}
                  Risk: {threat.risk_score ?? "-"}
                  {" • "}
                  ML:{" "}
                  {threat.ml_anomaly_score !== null &&
                  threat.ml_anomaly_score !== undefined
                    ? `${(
                        Number(threat.ml_anomaly_score) * 100
                      ).toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <RiskBadge
                  level={
                    threat.severity ||
                    threat.risk_level
                  }
                />

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  {threat.detection_method ===
                  "HYBRID_RULE_ML" ? (
                    <span style={{ color: "#38bdf8" }}>
                      RULE + ML
                    </span>
                  ) : (
                    threat.detection_method || "RULE ENGINE"
                  )}
                  {" • "}
                  {threat.status || "-"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SYSTEM WORKFLOW */}

      <div
        style={{
          marginTop: "25px",
          background: "#131d31",
          border: "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h2>SentinelFlow Detection Pipeline</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          {[
            "Authentication",
            "Activity Monitoring",
            "Rule Engine",
            "Isolation Forest",
            "Hybrid Risk",
            "Threat Detection",
            "Investigation",
            "Resolution",
          ].map((step, index) => (
            <React.Fragment key={step}>
              <div
                style={{
                  background: "#0d1628",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "12px 15px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                {step}
              </div>

              {index < 7 && (
                <span
                  style={{
                    color: "#3b82f6",
                    fontSize: "20px",
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

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "#131d31",
        border: "1px solid #26344d",
        borderRadius: "12px",
        padding: "22px",
        borderLeft: `4px solid ${color}`,
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

function MetricBox({ title, value, subtitle }) {
  return (
    <div
      style={{
        background: "#0d1628",
        border: "1px solid #26344d",
        borderRadius: "10px",
        padding: "18px",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: "800",
          marginTop: "8px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#38bdf8",
          fontSize: "12px",
          marginTop: "6px",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function DetectionRow({ label, value, total }) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div style={{ marginTop: "15px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
        }}
      >
        <span>{label}</span>

        <span style={{ color: "#60a5fa", fontWeight: "700" }}>
          {value} ({percentage}%)
        </span>
      </div>

      <div
        style={{
          marginTop: "7px",
          height: "7px",
          background: "#1e293b",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#3b82f6",
            borderRadius: "10px",
          }}
        />
      </div>
    </div>
  );
}

function PipelineBox({ text }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "#111c31",
        border: "1px solid #334155",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "700",
        textAlign: "center",
      }}
    >
      {text}
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
  borderBottom: "1px solid #26344d",
  color: "#60a5fa",
  fontSize: "12px",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #1e293b",
};