import React, { useEffect, useState } from "react";
import { auditAPI } from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    try {
      const response = await auditAPI.getAll();

      const data = response.data;

      setLogs(
        Array.isArray(data)
          ? data
          : data.logs ||
              data.auditLogs ||
              data.events ||
              []
      );

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Failed to load audit logs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();

    const interval = setInterval(
      loadLogs,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  const securityEvents = logs.filter(
    (log) =>
      String(
        log.module ||
          log.action ||
          ""
      )
        .toLowerCase()
        .includes("threat") ||
      String(
        log.action || ""
      )
        .toLowerCase()
        .includes("alert")
  ).length;

  const investigations = logs.filter(
    (log) =>
      String(
        log.module ||
          log.action ||
          ""
      )
        .toLowerCase()
        .includes("investigation")
  ).length;

  const getStatusColor = (status) => {
    const value = String(
      status || ""
    ).toUpperCase();

    if (
      value === "SUCCESS" ||
      value === "RESOLVED" ||
      value === "NORMAL"
    ) {
      return "#4ade80";
    }

    if (
      value === "OPEN" ||
      value === "CRITICAL" ||
      value === "FAILED"
    ) {
      return "#f87171";
    }

    return "#facc15";
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
              color: "#f8fafc",
              fontSize: "28px",
            }}
          >
            Audit Logs
          </h1>

          <p
            style={{
              marginTop: "7px",
              color: "#64748b",
            }}
          >
            Live security activity and
            system audit trail
          </p>
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            background: "#0b1f17",
            border:
              "1px solid #14532d",
            color: "#22c55e",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          ● LIVE
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

      {/* SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <SummaryCard
          title="Total Events"
          value={logs.length}
          subtitle="Live audit events"
          accent="#60a5fa"
        />

        <SummaryCard
          title="Security Events"
          value={securityEvents}
          subtitle="Threat-related activity"
          accent="#ef4444"
        />

        <SummaryCard
          title="Investigations"
          value={investigations}
          subtitle="Investigation activity"
          accent="#a78bfa"
        />
      </div>

      {/* AUDIT TABLE */}

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
              color: "#f8fafc",
              fontSize: "16px",
            }}
          >
            Security Audit Trail
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
            Loading audit events...
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No audit events found.
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
                minWidth: "950px",
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
                    "Time",
                    "User",
                    "Action",
                    "Module",
                    "Reference",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding:
                          "13px 12px",
                        textAlign: "left",
                        color:
                          "#64748b",
                        fontSize:
                          "11px",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.5px",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {logs.map(
                  (log, index) => {
                    const status =
                      log.status ||
                      "SUCCESS";

                    return (
                      <tr
                        key={
                          log.id ||
                          `${index}-${log.created_at}`
                        }
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
                          {formatDate(
                            log.created_at ||
                              log.timestamp ||
                              log.time
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
                          {log.username ||
                            log.user ||
                            "System"}
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            color:
                              "#60a5fa",
                            fontWeight: 700,
                          }}
                        >
                          {log.action ||
                            log.event ||
                            "-"}
                        </td>

                        <td
                          style={
                            cellStyle
                          }
                        >
                          {log.module ||
                            "-"}
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            color:
                              "#94a3b8",
                          }}
                        >
                          {log.reference ||
                            log.reference_id ||
                            log.activity_id ||
                            "-"}
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
                              background:
                                "#111827",
                              color:
                                getStatusColor(
                                  status
                                ),
                              fontSize:
                                "10px",
                              fontWeight:
                                800,
                            }}
                          >
                            {String(
                              status
                            ).toUpperCase()}
                          </span>
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            maxWidth:
                              "350px",
                          }}
                        >
                          {log.details ||
                            log.description ||
                            "-"}
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
        border:
          "1px solid #26344d",
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

const cellStyle = {
  padding: "13px 12px",
  color: "#94a3b8",
  fontSize: "11px",
};