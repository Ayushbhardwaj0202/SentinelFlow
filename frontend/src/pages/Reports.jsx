import React, { useEffect, useState } from "react";
import { reportsAPI } from "../services/api";

export default function Reports() {
  const [analytics, setAnalytics] =
    useState(null);

  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [selectedReport, setSelectedReport] =
    useState(null);

  const loadData = async () => {
    try {
      const analyticsResponse =
        await reportsAPI.getAll();

      const reportsResponse =
        await reportsAPI.getGenerated();

      setAnalytics(
        analyticsResponse.data
      );

      setReports(
        reportsResponse.data.reports || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const timer = setInterval(
      loadData,
      10000
    );

    return () => clearInterval(timer);
  }, []);

  const generateReport = async () => {
    try {
      setGenerating(true);

      const response =
        await reportsAPI.generate({
          generated_by:
            "Security Analyst",
        });

      setSelectedReport(
        response.data.report
      );

      await loadData();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to generate report"
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          color: "#e5e7eb",
        }}
      >
        Loading Security Reports...
      </div>
    );
  }

  const summary =
    analytics?.summary || {};

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
          <h1>
            Security Reports
          </h1>

          <p
            style={{
              color: "#94a3b8",
            }}
          >
            Generate live security risk
            assessment reports from
            SentinelFlow data.
          </p>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "13px 22px",
            fontWeight: "700",
            cursor: generating
              ? "wait"
              : "pointer",
          }}
        >
          {generating
            ? "Generating..."
            : "Generate Security Report"}
        </button>
      </div>

      {/* LIVE ANALYTICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "18px",
          marginTop: "30px",
        }}
      >
        <Card
          title="Activities Analyzed"
          value={
            summary.activitiesAnalyzed ||
            0
          }
        />

        <Card
          title="Threats Detected"
          value={
            summary.threatsDetected ||
            0
          }
        />

        <Card
          title="Open Threats"
          value={
            summary.openThreats ||
            0
          }
        />

        <Card
          title="Average Risk"
          value={`${
            summary.averageRiskScore ||
            0
          }/100`}
        />
      </div>

      {/* GENERATED REPORT */}

      {selectedReport && (
        <div
          style={{
            marginTop: "30px",
            background: "#131d31",
            border:
              "1px solid #3b82f6",
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
            }}
          >
            <div>
              <h2>
                Security Risk Assessment
              </h2>

              <p
                style={{
                  color: "#60a5fa",
                  fontWeight: "700",
                }}
              >
                {
                  selectedReport.report_number
                }
              </p>
            </div>

            <span
              style={{
                color: "#22c55e",
                fontWeight: "700",
              }}
            >
              REPORT GENERATED
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "15px",
              margin:
                "20px 0",
            }}
          >
            <MiniStat
              label="Activities"
              value={
                selectedReport.activities_analyzed
              }
            />

            <MiniStat
              label="Threats"
              value={
                selectedReport.threats_detected
              }
            />

            <MiniStat
              label="Critical"
              value={
                selectedReport.critical_threats
              }
            />

            <MiniStat
              label="Risk Score"
              value={`${selectedReport.average_risk_score}/100`}
            />
          </div>

          <Section
            title="Risk Assessment"
            text={
              selectedReport.risk_summary
            }
          />

          <Section
            title="Threat Summary"
            text={
              selectedReport.threat_summary
            }
          />

          <Section
            title="Investigation Summary"
            text={
              selectedReport.investigation_summary
            }
          />

          <Section
            title="Security Recommendations"
            text={
              selectedReport.recommendations
            }
          />

          <p
            style={{
              color: "#64748b",
              marginTop: "25px",
              fontSize: "12px",
            }}
          >
            Generated by{" "}
            {
              selectedReport.generated_by
            }{" "}
            on{" "}
            {new Date(
              selectedReport.created_at
            ).toLocaleString()}
          </p>
        </div>
      )}

      {/* PREVIOUS REPORTS */}

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
        <h2>
          Generated Reports
        </h2>

        {reports.length === 0 ? (
          <p
            style={{
              color: "#94a3b8",
            }}
          >
            No security reports generated
            yet.
          </p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                padding:
                  "15px 0",
                borderBottom:
                  "1px solid #26344d",
              }}
            >
              <div>
                <strong>
                  {
                    report.report_number
                  }
                </strong>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize:
                      "12px",
                    marginTop: "4px",
                  }}
                >
                  {
                    report.report_type
                  }{" "}
                  •{" "}
                  {new Date(
                    report.created_at
                  ).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedReport(
                    report
                  )
                }
                style={{
                  background:
                    "#172b4d",
                  color:
                    "#60a5fa",
                  border:
                    "1px solid #334155",
                  borderRadius:
                    "6px",
                  padding:
                    "8px 14px",
                  cursor:
                    "pointer",
                }}
              >
                View Report
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#131d31",
        border:
          "1px solid #26344d",
        borderRadius: "12px",
        padding: "22px",
        borderLeft:
          "4px solid #3b82f6",
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
    </div>
  );
}

function MiniStat({
  label,
  value,
}) {
  return (
    <div
      style={{
        background: "#0d1628",
        padding: "15px",
        borderRadius: "8px",
        border:
          "1px solid #26344d",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "11px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          marginTop: "5px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  text,
}) {
  return (
    <div
      style={{
        marginTop: "20px",
      }}
    >
      <h3
        style={{
          color: "#60a5fa",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#cbd5e1",
          lineHeight: "1.7",
        }}
      >
        {text}
      </p>
    </div>
  );
}