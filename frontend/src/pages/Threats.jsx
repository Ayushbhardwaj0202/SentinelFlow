import React, { useEffect, useState } from "react";
import { threatsAPI } from "../services/api";

export default function Threats() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadThreats = async () => {
    try {
      const response = await threatsAPI.getAll();

      const data = response.data;

      setThreats(
        Array.isArray(data)
          ? data
          : data.threats || []
      );

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Failed to load threats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreats();

    const interval = setInterval(
      loadThreats,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  const updateThreat = async (
    id,
    status
  ) => {
    try {
      await threatsAPI.update(id, {
        status,
      });

      await loadThreats();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Failed to update threat"
      );
    }
  };

  const total = threats.length;

  const open = threats.filter(
    (t) =>
      String(t.status).toUpperCase() ===
      "OPEN"
  ).length;

  const critical = threats.filter(
    (t) =>
      String(t.severity).toUpperCase() ===
      "CRITICAL"
  ).length;

  const high = threats.filter(
    (t) =>
      String(t.severity).toUpperCase() ===
      "HIGH"
  ).length;

  const mlThreats = threats.filter(
    (t) =>
      t.detection_method ===
      "HYBRID_RULE_ML"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d19",
        color: "#e2e8f0",
        padding: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: "28px",
            }}
          >
            Threat Detection
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "7px",
            }}
          >
            Real-time rule-based and ML-assisted
            threat detection
          </p>
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            background: "#0b1f17",
            border: "1px solid #14532d",
            color: "#22c55e",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          ● DETECTION ENGINE ONLINE
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#35151a",
            border: "1px solid #7f1d1d",
            color: "#f87171",
            padding: "14px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}

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
          title="Total Threats"
          value={total}
          subtitle="Detected events"
          accent="#60a5fa"
        />

        <SummaryCard
          title="Open"
          value={open}
          subtitle="Requires attention"
          accent="#ef4444"
        />

        <SummaryCard
          title="Critical"
          value={critical}
          subtitle="Critical severity"
          accent="#ef4444"
        />

        <SummaryCard
          title="High"
          value={high}
          subtitle="High severity"
          accent="#fb923c"
        />

        <SummaryCard
          title="ML-Assisted"
          value={mlThreats}
          subtitle="Rule + Isolation Forest"
          accent="#a78bfa"
        />
      </div>

      {/* DETECTION PIPELINE */}

      <div
        style={{
          background: "#0b1220",
          border: "1px solid #26344d",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            margin: "0 0 15px",
            fontSize: "16px",
            color: "#f8fafc",
          }}
        >
          Threat Detection Architecture
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {[
            "Activity",
            "Rule Engine",
            "Isolation Forest",
            "Hybrid Risk",
            "Threat Alert",
            "Investigation",
          ].map((item, index) => (
            <React.Fragment key={item}>
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
                {item}
              </div>

              {index < 5 && (
                <span
                  style={{
                    color: "#3b82f6",
                    fontSize: "18px",
                  }}
                >
                  →
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* THREAT TABLE */}

      <div
        style={{
          background: "#0b1220",
          border: "1px solid #26344d",
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
            Live Threat Intelligence
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
            Loading threats...
          </div>
        ) : threats.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No threats detected.
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
                minWidth: "1200px",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#0f172a",
                  }}
                >
                  {[
                    "ID",
                    "User",
                    "Threat",
                    "Severity",
                    "Risk",
                    "ML Score",
                    "Detection",
                    "Activity",
                    "Status",
                    "Created",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding:
                          "13px 12px",
                        textAlign: "left",
                        color: "#64748b",
                        fontSize: "11px",
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
                {threats.map(
                  (threat) => {
                    const mlScore =
                      Number(
                        threat.ml_anomaly_score ||
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

                    return (
                      <tr
                        key={threat.id}
                        style={{
                          borderTop:
                            "1px solid #1e293b",
                        }}
                      >
                        <td
                          style={
                            cellStyle
                          }
                        >
                          THR-
                          {String(
                            threat.id
                          ).padStart(
                            3,
                            "0"
                          )}
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
                            threat.username
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
                            threat.threat_type
                          }
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <SeverityBadge
                            value={
                              threat.severity
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
                              threat.risk_score
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
                          <span
                            style={{
                              color:
                                threat.detection_method ===
                                "HYBRID_RULE_ML"
                                  ? "#a78bfa"
                                  : "#94a3b8",
                              fontSize:
                                "10px",
                              fontWeight:
                                800,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {threat.detection_method ===
                            "HYBRID_RULE_ML"
                              ? "RULE + ML"
                              : "RULE"}
                          </span>
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          {threat.activity_id
                            ? `#${threat.activity_id}`
                            : "-"}
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          <StatusBadge
                            value={
                              threat.status
                            }
                          />
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDate(
                            threat.created_at
                          )}
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          {String(
                            threat.status
                          ).toUpperCase() ===
                          "OPEN" && (
                            <button
                              onClick={() =>
                                updateThreat(
                                  threat.id,
                                  "UNDER_INVESTIGATION"
                                )
                              }
                              style={
                                actionButton
                              }
                            >
                              Investigate
                            </button>
                          )}

                          {String(
                            threat.status
                          ).toUpperCase() ===
                            "UNDER_INVESTIGATION" && (
                            <button
                              onClick={() =>
                                updateThreat(
                                  threat.id,
                                  "RESOLVED"
                                )
                              }
                              style={{
                                ...actionButton,
                                color:
                                  "#4ade80",
                              }}
                            >
                              Resolve
                            </button>
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
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  accent,
}) {
  return (
    <div
      style={{
        background: "#0b1220",
        border: "1px solid #26344d",
        borderTop:
          `2px solid ${accent}`,
        borderRadius: "9px",
        padding: "18px",
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
          fontSize: "26px",
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

  let color = "#4ade80";
  let background = "#0b1f17";

  if (value >= 80) {
    color = "#f87171";
    background = "#35151a";
  } else if (value >= 60) {
    color = "#fb923c";
    background = "#2d1b0d";
  } else if (value >= 30) {
    color = "#facc15";
    background = "#2a2508";
  }

  return (
    <span
      style={{
        display: "inline-block",
        minWidth: "35px",
        textAlign: "center",
        padding: "4px 7px",
        borderRadius: "5px",
        fontSize: "10px",
        fontWeight: 800,
        color,
        background,
      }}
    >
      {value}
    </span>
  );
}

function SeverityBadge({ value }) {
  const level = String(
    value || "LOW"
  ).toUpperCase();

  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: 800,
        color:
          level === "CRITICAL"
            ? "#f87171"
            : level === "HIGH"
            ? "#fb923c"
            : level === "MEDIUM"
            ? "#facc15"
            : "#4ade80",
        background:
          level === "CRITICAL"
            ? "#35151a"
            : level === "HIGH"
            ? "#2d1b0d"
            : level === "MEDIUM"
            ? "#2a2508"
            : "#0b1f17",
      }}
    >
      {level}
    </span>
  );
}

function StatusBadge({ value }) {
  const status = String(
    value || "OPEN"
  ).toUpperCase();

  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: "12px",
        background: "#111827",
        color:
          status === "RESOLVED"
            ? "#4ade80"
            : status ===
              "UNDER_INVESTIGATION"
            ? "#facc15"
            : "#f87171",
        fontSize: "10px",
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {status.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(
    date
  ).toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

const cellStyle = {
  padding: "13px 12px",
  color: "#94a3b8",
  fontSize: "11px",
};

const actionButton = {
  border: "1px solid #334155",
  background: "#111827",
  color: "#60a5fa",
  borderRadius: "6px",
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: 700,
};