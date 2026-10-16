import React, { useEffect, useState } from "react";
import { activitiesAPI } from "../services/api";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivities = async () => {
    try {
      const response = await activitiesAPI.getAll();

      const data = response.data;

      setActivities(
        Array.isArray(data)
          ? data
          : data.activities || []
      );

      setError("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to load activities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();

    const interval = setInterval(
      loadActivities,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  const getRiskClass = (level) => {
    switch (
      String(level || "").toUpperCase()
    ) {
      case "CRITICAL":
        return "critical";

      case "HIGH":
        return "high";

      case "MEDIUM":
        return "medium";

      default:
        return "low";
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 30) return "medium";
    return "low";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "short",
        timeStyle: "medium",
      }
    );
  };

  const totalActivities =
    activities.length;

  const mlDetected =
    activities.filter(
      (item) =>
        item.ml_anomaly === true ||
        item.ml_anomaly === "true"
    ).length;

  const hybridDetected =
    activities.filter(
      (item) =>
        item.detection_method ===
        "HYBRID_RULE_ML"
    ).length;

  const criticalActivities =
    activities.filter(
      (item) =>
        String(
          item.risk_level || ""
        ).toUpperCase() === "CRITICAL"
    ).length;

  const averageHybrid =
    activities.length > 0
      ? (
          activities.reduce(
            (sum, item) =>
              sum +
              Number(
                item.hybrid_risk_score ??
                  item.risk_score ??
                  0
              ),
            0
          ) / activities.length
        ).toFixed(2)
      : "0.00";

  return (
    <div
      style={{
        padding: "30px",
        color: "#e2e8f0",
        minHeight: "100vh",
        background: "#080d19",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#f8fafc",
            }}
          >
            Activity Monitoring
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "7px",
            }}
          >
            Real-time employee activity
            and hybrid ML risk analysis
          </p>
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            border:
              "1px solid #14532d",
            background: "#0b1f17",
            color: "#22c55e",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          ● LIVE MONITORING
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#35151a",
            border:
              "1px solid #7f1d1d",
            color: "#f87171",
            padding: "14px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(5, 1fr)",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <SummaryCard
          title="Total Activities"
          value={totalActivities}
          subtitle="Live database records"
        />

        <SummaryCard
          title="ML Anomalies"
          value={mlDetected}
          subtitle="Isolation Forest"
          accent="#f59e0b"
        />

        <SummaryCard
          title="Hybrid Detected"
          value={hybridDetected}
          subtitle="Rule + ML"
          accent="#8b5cf6"
        />

        <SummaryCard
          title="Critical"
          value={criticalActivities}
          subtitle="High-priority activity"
          accent="#ef4444"
        />

        <SummaryCard
          title="Avg Hybrid Risk"
          value={`${averageHybrid}/100`}
          subtitle="Final risk score"
          accent="#60a5fa"
        />
      </div>

      {/* =====================================================
          ML PIPELINE
      ===================================================== */}

      <div
        style={{
          background: "#0b1220",
          border:
            "1px solid #26344d",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                color: "#f8fafc",
              }}
            >
              Hybrid Detection Pipeline
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Rule-based security policies
              combined with Isolation Forest
              anomaly detection
            </p>
          </div>

          <div
            style={{
              color: "#60a5fa",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            ML ENGINE ONLINE
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <PipelineBox text="Activity" />
          <Arrow />
          <PipelineBox text="Rule Engine" />
          <Arrow />
          <PipelineBox text="Isolation Forest" />
          <Arrow />
          <PipelineBox text="Hybrid Risk" />
          <Arrow />
          <PipelineBox text="Threat Detection" />
        </div>
      </div>

      {/* =====================================================
          ACTIVITY TABLE
      ===================================================== */}

      <div
        style={{
          background: "#0b1220",
          border:
            "1px solid #26344d",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom:
              "1px solid #26344d",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#f8fafc",
            }}
          >
            Live Activity Stream
          </h2>
        </div>

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading activity data...
          </div>
        ) : activities.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No activities found.
          </div>
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
                minWidth: "1200px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#0f172a",
                  }}
                >
                  {[
                    "ID",
                    "User",
                    "Activity",
                    "Resource",
                    "Device",
                    "Rule Score",
                    "ML Score",
                    "Hybrid Score",
                    "ML",
                    "Risk",
                    "Detection",
                    "Time",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: "left",
                        padding:
                          "13px 12px",
                        color:
                          "#64748b",
                        fontSize:
                          "11px",
                        fontWeight:
                          700,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.5px",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {activities.map(
                  (activity) => {
                    const ruleScore =
                      Number(
                        activity.rule_risk_score ??
                          0
                      );

                    const mlScore =
                      Number(
                        activity.ml_anomaly_score ??
                          0
                      );

                    const hybridScore =
                      Number(
                        activity.hybrid_risk_score ??
                          activity.risk_score ??
                          0
                      );

                    const mlPercent =
                      mlScore <= 1
                        ? Math.round(
                            mlScore * 100
                          )
                        : Math.round(
                            mlScore
                          );

                    const isML =
                      activity.ml_anomaly ===
                        true ||
                      activity.ml_anomaly ===
                        "true";

                    return (
                      <tr
                        key={
                          activity.id
                        }
                        style={{
                          borderTop:
                            "1px solid #1e293b",
                        }}
                      >
                        <td
                          style={cellStyle}
                        >
                          #{activity.id}
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            color:
                              "#f8fafc",
                            fontWeight: 700,
                          }}
                        >
                          {
                            activity.username
                          }
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            color:
                              "#60a5fa",
                            fontWeight: 700,
                          }}
                        >
                          {
                            activity.activity_type
                          }
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          {
                            activity.resource ||
                            "-"
                          }
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          {
                            activity.device ||
                            "-"
                          }
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <ScoreBadge
                            score={
                              ruleScore
                            }
                          />
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <ScoreBadge
                            score={
                              mlPercent
                            }
                          />
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <ScoreBadge
                            score={
                              hybridScore
                            }
                          />
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <span
                            style={{
                              padding:
                                "4px 8px",
                              borderRadius:
                                "12px",
                              fontSize:
                                "10px",
                              fontWeight:
                                800,
                              color:
                                isML
                                  ? "#f59e0b"
                                  : "#64748b",
                              background:
                                isML
                                  ? "#2d2108"
                                  : "#111827",
                              border:
                                `1px solid ${
                                  isML
                                    ? "#92400e"
                                    : "#334155"
                                }`,
                            }}
                          >
                            {isML
                              ? "ANOMALY"
                              : "NORMAL"}
                          </span>
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <span
                            style={{
                              padding:
                                "5px 9px",
                              borderRadius:
                                "12px",
                              fontSize:
                                "10px",
                              fontWeight:
                                800,
                              color:
                                riskColor(
                                  activity.risk_level
                                ),
                              background:
                                riskBackground(
                                  activity.risk_level
                                ),
                            }}
                          >
                            {
                              activity.risk_level ||
                              "LOW"
                            }
                          </span>
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <span
                            style={{
                              fontSize:
                                "10px",
                              color:
                                activity.detection_method ===
                                "HYBRID_RULE_ML"
                                  ? "#a78bfa"
                                  : "#94a3b8",
                              fontWeight:
                                700,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              activity.detection_method ===
                              "HYBRID_RULE_ML"
                                ? "RULE + ML"
                                : "RULE"
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            whiteSpace:
                              "nowrap",
                            color:
                              "#64748b",
                          }}
                        >
                          {formatDate(
                            activity.created_at
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          EXPLANATION
      ===================================================== */}

      <div
        style={{
          marginTop: "20px",
          padding: "18px 20px",
          background: "#0b1220",
          border:
            "1px solid #26344d",
          borderRadius: "10px",
        }}
      >
        <h3
          style={{
            margin:
              "0 0 10px",
            fontSize: "14px",
            color: "#f8fafc",
          }}
        >
          Detection Methodology
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "15px",
          }}
        >
          <MethodCard
            title="Rule Risk"
            description="Explainable security policies evaluate known suspicious activities such as failed logins, sensitive file access and data exports."
          />

          <MethodCard
            title="ML Anomaly"
            description="Isolation Forest evaluates behavioural deviations using temporal, activity, device, resource and frequency features."
          />

          <MethodCard
            title="Hybrid Risk"
            description="The final risk combines the rule score and ML anomaly score before triggering threat detection."
          />
        </div>
      </div>
    </div>
  );
}


// ============================================================
// COMPONENTS
// ============================================================

function SummaryCard({
  title,
  value,
  subtitle,
  accent = "#60a5fa",
}) {
  return (
    <div
      style={{
        background: "#0b1220",
        border:
          "1px solid #26344d",
        borderRadius: "9px",
        padding: "18px",
        borderTop:
          `2px solid ${accent}`,
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "11px",
          fontWeight: 700,
          textTransform:
            "uppercase",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#f8fafc",
          fontSize: "25px",
          fontWeight: 800,
          marginTop: "7px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: "10px",
          marginTop: "4px",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const value = Number(score) || 0;

  return (
    <span
      style={{
        display: "inline-block",
        minWidth: "38px",
        textAlign: "center",
        padding: "4px 7px",
        borderRadius: "5px",
        fontSize: "11px",
        fontWeight: 800,
        color: riskColor(
          value >= 80
            ? "CRITICAL"
            : value >= 60
            ? "HIGH"
            : value >= 30
            ? "MEDIUM"
            : "LOW"
        ),
        background:
          riskBackground(
            value >= 80
              ? "CRITICAL"
              : value >= 60
              ? "HIGH"
              : value >= 30
              ? "MEDIUM"
              : "LOW"
          ),
      }}
    >
      {value}
    </span>
  );
}

function PipelineBox({ text }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "#111b2e",
        border:
          "1px solid #334155",
        borderRadius: "7px",
        color: "#cbd5e1",
        fontSize: "11px",
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  );
}

function Arrow() {
  return (
    <span
      style={{
        color: "#3b82f6",
        fontSize: "18px",
      }}
    >
      →
    </span>
  );
}

function MethodCard({
  title,
  description,
}) {
  return (
    <div
      style={{
        padding: "14px",
        background: "#0f172a",
        border:
          "1px solid #1e293b",
        borderRadius: "7px",
      }}
    >
      <div
        style={{
          color: "#60a5fa",
          fontSize: "12px",
          fontWeight: 800,
          marginBottom: "6px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "11px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>
    </div>
  );
}


// ============================================================
// STYLES / HELPERS
// ============================================================

const cellStyle = {
  padding: "13px 12px",
  color: "#94a3b8",
  fontSize: "11px",
};

function riskColor(level) {
  switch (
    String(level || "").toUpperCase()
  ) {
    case "CRITICAL":
      return "#f87171";

    case "HIGH":
      return "#fb923c";

    case "MEDIUM":
      return "#facc15";

    default:
      return "#4ade80";
  }
}

function riskBackground(level) {
  switch (
    String(level || "").toUpperCase()
  ) {
    case "CRITICAL":
      return "#35151a";

    case "HIGH":
      return "#2d1b0d";

    case "MEDIUM":
      return "#2a2508";

    default:
      return "#0b1f17";
  }
}