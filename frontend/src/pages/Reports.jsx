import React, { useEffect, useMemo, useState } from "react";
import {
  activitiesAPI,
  threatsAPI,
  reportsAPI,
} from "../services/api";

export default function Reports() {
  const [activities, setActivities] = useState([]);
  const [threats, setThreats] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    // Activities
    try {
      const response = await activitiesAPI.getAll();

      const data =
        response.data?.activities ||
        response.data?.data ||
        (Array.isArray(response.data)
          ? response.data
          : []);

      setActivities(data);
    } catch (error) {
      console.error("Activities loading error:", error);
    }

    // Threats
    try {
      const response = await threatsAPI.getAll();

      const data =
        response.data?.threats ||
        response.data?.data ||
        (Array.isArray(response.data)
          ? response.data
          : []);

      setThreats(data);
    } catch (error) {
      console.error("Threats loading error:", error);
    }

    // Generated reports
    try {
      const response = await reportsAPI.getGenerated();

      const data =
        response.data?.reports ||
        response.data?.data ||
        (Array.isArray(response.data)
          ? response.data
          : []);

      setReports(data);
    } catch (error) {
      console.error(
        "Generated reports loading error:",
        error
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 5000);

    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const totalActivities = activities.length;
    const totalThreats = threats.length;

    const mlAnomalies = activities.filter(
      (a) =>
        a.ml_anomaly === true ||
        a.ml_anomaly === "true" ||
        a.ml_anomaly === 1
    ).length;

    const hybridDetections = activities.filter(
      (a) =>
        a.detection_method === "HYBRID_RULE_ML"
    ).length;

    const ruleOnly = activities.filter(
      (a) =>
        a.detection_method === "RULE_ENGINE"
    ).length;

    const criticalThreats = threats.filter(
      (t) => t.severity === "CRITICAL"
    ).length;

    const highThreats = threats.filter(
      (t) => t.severity === "HIGH"
    ).length;

    const mlScores = activities
      .map((a) => Number(a.ml_anomaly_score))
      .filter((x) => Number.isFinite(x));

    const hybridScores = activities
      .map((a) => Number(a.hybrid_risk_score))
      .filter((x) => Number.isFinite(x));

    const averageMLScore =
      mlScores.length > 0
        ? (
            (mlScores.reduce((a, b) => a + b, 0) /
              mlScores.length) *
            100
          ).toFixed(1)
        : "0.0";

    const averageHybridRisk =
      hybridScores.length > 0
        ? (
            hybridScores.reduce(
              (a, b) => a + b,
              0
            ) / hybridScores.length
          ).toFixed(1)
        : "0.0";

    const anomalyRate =
      totalActivities > 0
        ? (
            (mlAnomalies / totalActivities) *
            100
          ).toFixed(1)
        : "0.0";

    const mlThreats = threats.filter(
      (t) =>
        t.detection_method ===
          "HYBRID_RULE_ML" ||
        Number(t.ml_anomaly_score) > 0
    ).length;

    return {
      totalActivities,
      totalThreats,
      mlAnomalies,
      hybridDetections,
      ruleOnly,
      criticalThreats,
      highThreats,
      averageMLScore,
      averageHybridRisk,
      anomalyRate,
      mlThreats,
    };
  }, [activities, threats]);

  const generateReport = async () => {
    try {
      setGenerating(true);
      setMessage("");

      await reportsAPI.generate({
        report_type: "SECURITY_RISK_ANALYSIS",
      });

      setMessage(
        "Security report generated successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
          "Failed to generate report."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={page}>
        <h1>Security Reports</h1>
        <p style={muted}>
          Loading security analytics...
        </p>
      </div>
    );
  }

  return (
    <div style={page}>

      {/* HEADER */}

      <div style={header}>
        <div>
          <h1>Security Reports</h1>

          <p style={muted}>
            Security intelligence, risk analytics and
            machine-learning detection performance.
          </p>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          style={button}
        >
          {generating
            ? "Generating..."
            : "Generate Security Report"}
        </button>
      </div>

      {message && (
        <div style={messageBox}>
          {message}
        </div>
      )}

      {/* SECURITY OVERVIEW */}

      <h2>Security Overview</h2>

      <div style={grid4}>
        <Card
          title="Activities Analyzed"
          value={stats.totalActivities}
          color="#3b82f6"
        />

        <Card
          title="Threats Detected"
          value={stats.totalThreats}
          color="#ef4444"
        />

        <Card
          title="Critical Threats"
          value={stats.criticalThreats}
          color="#dc2626"
        />

        <Card
          title="High Threats"
          value={stats.highThreats}
          color="#f97316"
        />
      </div>

      {/* ML ANALYTICS */}

      <h2>Machine Learning Analytics</h2>

      <div style={grid4}>
        <Card
          title="ML Anomalies"
          value={stats.mlAnomalies}
          subtitle={`${stats.anomalyRate}% anomaly rate`}
          color="#06b6d4"
        />

        <Card
          title="Hybrid Detections"
          value={stats.hybridDetections}
          subtitle="Rule + Isolation Forest"
          color="#8b5cf6"
        />

        <Card
          title="Average ML Score"
          value={`${stats.averageMLScore}%`}
          subtitle="Anomaly signal"
          color="#14b8a6"
        />

        <Card
          title="ML-Assisted Threats"
          value={stats.mlThreats}
          subtitle="Threat alerts"
          color="#f43f5e"
        />
      </div>

      {/* ARCHITECTURE */}

      <div style={panel}>
        <h2>Hybrid Detection Architecture</h2>

        <div style={pipeline}>
          <Step n="1" title="Activity" text="User behaviour" />
          <Arrow />
          <Step n="2" title="Rule Engine" text="Known threats" />
          <Arrow />
          <Step
            n="3"
            title="Isolation Forest"
            text="Anomaly detection"
          />
          <Arrow />
          <Step n="4" title="Hybrid Risk" text="Combined score" />
          <Arrow />
          <Step n="5" title="Threat Alert" text="Security response" />
        </div>
      </div>

      {/* DETECTION BREAKDOWN */}

      <div style={twoColumns}>

        <div style={panel}>
          <h2>Detection Method Breakdown</h2>

          <Progress
            label="Hybrid Rule + ML"
            value={stats.hybridDetections}
            total={stats.totalActivities}
          />

          <Progress
            label="Rule Engine Only"
            value={stats.ruleOnly}
            total={stats.totalActivities}
          />

          <Progress
            label="ML Anomalies"
            value={stats.mlAnomalies}
            total={stats.totalActivities}
          />
        </div>

        <div style={panel}>
          <h2>Risk Intelligence</h2>

          <Info
            label="Average Hybrid Risk"
            value={`${stats.averageHybridRisk}/100`}
          />

          <Info
            label="ML Anomaly Rate"
            value={`${stats.anomalyRate}%`}
          />

          <Info
            label="ML-Assisted Threats"
            value={stats.mlThreats}
          />

          <Info
            label="Total Security Events"
            value={stats.totalActivities}
          />
        </div>

      </div>

      {/* ACTIVITY ANALYSIS */}

      <h2>ML Activity Analysis</h2>

      <div style={panel}>
        <div style={scroll}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>USER</th>
                <th style={th}>ACTIVITY</th>
                <th style={th}>RULE SCORE</th>
                <th style={th}>ML SCORE</th>
                <th style={th}>HYBRID</th>
                <th style={th}>ML STATUS</th>
                <th style={th}>DETECTION</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td style={td}>
                    {a.username}
                  </td>

                  <td style={td}>
                    {a.activity_type}
                  </td>

                  <td style={td}>
                    {a.rule_risk_score ??
                      a.risk_score ??
                      0}
                  </td>

                  <td style={td}>
                    {Number.isFinite(
                      Number(a.ml_anomaly_score)
                    )
                      ? `${(
                          Number(
                            a.ml_anomaly_score
                          ) * 100
                        ).toFixed(1)}%`
                      : "N/A"}
                  </td>

                  <td
                    style={{
                      ...td,
                      fontWeight: "800",
                    }}
                  >
                    {a.hybrid_risk_score ??
                      a.risk_score ??
                      0}
                  </td>

                  <td style={td}>
                    {a.ml_anomaly ? (
                      <span style={danger}>
                        ANOMALY
                      </span>
                    ) : (
                      <span style={success}>
                        NORMAL
                      </span>
                    )}
                  </td>

                  <td style={td}>
                    {a.detection_method ===
                    "HYBRID_RULE_ML" ? (
                      <span style={info}>
                        RULE + ML
                      </span>
                    ) : (
                      "RULE ENGINE"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* THREAT ANALYSIS */}

      <h2>Threat Intelligence</h2>

      <div style={panel}>
        <div style={scroll}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>THREAT</th>
                <th style={th}>USER</th>
                <th style={th}>SEVERITY</th>
                <th style={th}>RISK</th>
                <th style={th}>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {threats.map((t) => (
                <tr key={t.id}>
                  <td style={td}>
                    {t.threat_type}
                  </td>

                  <td style={td}>
                    {t.username}
                  </td>

                  <td style={td}>
                    <Severity level={t.severity} />
                  </td>

                  <td style={td}>
                    {t.risk_score}/100
                  </td>

                  <td style={td}>
                    {t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATED REPORTS */}

      <h2>Generated Security Reports</h2>

      <div style={panel}>
        {reports.length === 0 ? (
          <p style={muted}>
            No generated reports yet.
          </p>
        ) : (
          <div style={scroll}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>REPORT</th>
                  <th style={th}>TYPE</th>
                  <th style={th}>ACTIVITIES</th>
                  <th style={th}>THREATS</th>
                  <th style={th}>CRITICAL</th>
                  <th style={th}>AVG RISK</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={td}>
                      {r.report_number ||
                        `RPT-${r.id}`}
                    </td>

                    <td style={td}>
                      {r.report_type ||
                        "SECURITY ANALYSIS"}
                    </td>

                    <td style={td}>
                      {r.activities_analyzed ?? 0}
                    </td>

                    <td style={td}>
                      {r.threats_detected ?? 0}
                    </td>

                    <td style={td}>
                      {r.critical_threats ?? 0}
                    </td>

                    <td style={td}>
                      {r.average_risk_score ?? 0}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
  color,
}) {
  return (
    <div
      style={{
        background: "#131d31",
        border: "1px solid #26344d",
        borderLeft: `4px solid ${color}`,
        borderRadius: "12px",
        padding: "22px",
      }}
    >
      <div style={muted}>{title}</div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "800",
          marginTop: "8px",
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            color: "#38bdf8",
            fontSize: "12px",
            marginTop: "5px",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

function Step({ n, title, text }) {
  return (
    <div
      style={{
        flex: "1 1 150px",
        background: "#0d1628",
        border: "1px solid #334155",
        borderRadius: "10px",
        padding: "18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 8px",
          fontWeight: "800",
        }}
      >
        {n}
      </div>

      <strong>{title}</strong>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "5px",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <span
      style={{
        color: "#3b82f6",
        fontSize: "24px",
      }}
    >
      →
    </span>
  );
}

function Progress({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div style={{ marginTop: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
        }}
      >
        <span>{label}</span>
        <strong>
          {value} ({percentage}%)
        </strong>
      </div>

      <div
        style={{
          height: "7px",
          background: "#1e293b",
          borderRadius: "10px",
          marginTop: "7px",
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

function Info({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "13px 0",
        borderBottom: "1px solid #26344d",
      }}
    >
      <span style={muted}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Severity({ level }) {
  const color =
    level === "CRITICAL"
      ? "#ef4444"
      : level === "HIGH"
      ? "#f97316"
      : level === "MEDIUM"
      ? "#eab308"
      : "#22c55e";

  return (
    <span
      style={{
        color,
        fontWeight: "800",
      }}
    >
      {level || "LOW"}
    </span>
  );
}

const page = {
  minHeight: "100vh",
  background: "#080d19",
  color: "#e5e7eb",
  padding: "30px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};

const muted = {
  color: "#94a3b8",
};

const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "18px",
  marginBottom: "28px",
};

const twoColumns = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
  marginBottom: "28px",
};

const panel = {
  background: "#131d31",
  border: "1px solid #26344d",
  borderRadius: "12px",
  padding: "22px",
  marginBottom: "28px",
};

const pipeline = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const button = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "13px 20px",
  fontWeight: "700",
  cursor: "pointer",
};

const messageBox = {
  margin: "20px 0",
  padding: "13px 18px",
  borderRadius: "8px",
  background: "#0d2235",
  border: "1px solid #075985",
  color: "#38bdf8",
};

const scroll = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "13px",
  color: "#60a5fa",
  fontSize: "11px",
  borderBottom: "1px solid #26344d",
};

const td = {
  padding: "13px",
  borderBottom: "1px solid #1e293b",
  fontSize: "13px",
};

const danger = {
  color: "#ef4444",
  fontWeight: "800",
};

const success = {
  color: "#22c55e",
  fontWeight: "800",
};

const info = {
  color: "#38bdf8",
  fontWeight: "800",
};