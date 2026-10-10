import React, { useEffect, useState } from "react";
import { investigationsAPI } from "../services/api";

export default function Investigations() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCases = async () => {
    try {
      const response = await investigationsAPI.getAll();
      setCases(response.data.investigations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();

    const timer = setInterval(loadCases, 5000);

    return () => clearInterval(timer);
  }, []);

  const createInvestigation = async (threatId) => {
    try {
      await investigationsAPI.create({
        threat_id: threatId,
        investigator: "Security Analyst",
        findings:
          "Threat reviewed by security analyst.",
        evidence:
          "Activity logs, risk score and threat alert.",
      });

      await loadCases();
    } catch (error) {
      alert(
        error.response?.data?.error ||
        "Failed to create investigation"
      );
    }
  };

  const resolveCase = async (id) => {
    try {
      await investigationsAPI.update(id, {
        status: "RESOLVED",
        findings:
          "Threat investigated and evidence reviewed.",
        evidence:
          "Activity logs, risk assessment and threat record.",
        resolution:
          "Incident contained and resolved by Security Analyst.",
      });

      await loadCases();
    } catch (error) {
      alert(
        error.response?.data?.error ||
        "Failed to resolve investigation"
      );
    }
  };

  const active = cases.filter(
    (item) =>
      item.status === "UNDER_INVESTIGATION"
  ).length;

  const resolved = cases.filter(
    (item) =>
      item.status === "RESOLVED"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d19",
        color: "#e5e7eb",
        padding: "30px",
      }}
    >
      <h1>Security Investigation</h1>

      <p>
        Investigate detected threats, review
        evidence and resolve security incidents.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3,1fr)",
          gap: "18px",
          margin: "25px 0",
        }}
      >
        <Stat
          title="Total Cases"
          value={cases.length}
        />

        <Stat
          title="Under Investigation"
          value={active}
        />

        <Stat
          title="Resolved"
          value={resolved}
        />
      </div>

      <div
        style={{
          background: "#131d31",
          border: "1px solid #26344d",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h2>Investigation Cases</h2>

        {loading ? (
          <p>Loading...</p>
        ) : cases.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#94a3b8",
            }}
          >
            <h3>No investigation cases</h3>

            <p>
              Create an investigation from a
              detected threat.
            </p>
          </div>
        ) : (
          cases.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#0d1628",
                border: "1px solid #26344d",
                borderRadius: "10px",
                padding: "22px",
                marginBottom: "16px",
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
                  <span
                    style={{
                      color: "#60a5fa",
                      fontWeight: "700",
                    }}
                  >
                    {item.case_number}
                  </span>

                  <h3>
                    {item.title}
                  </h3>
                </div>

                <span
                  style={{
                    color:
                      item.status === "RESOLVED"
                        ? "#22c55e"
                        : "#eab308",
                    fontWeight: "700",
                  }}
                >
                  {item.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4,1fr)",
                  gap: "20px",
                  margin: "20px 0",
                }}
              >
                <Info
                  label="Investigator"
                  value={item.investigator}
                />

                <Info
                  label="Severity"
                  value={item.severity}
                />

                <Info
                  label="Threat"
                  value={
                    `THR-${String(
                      item.threat_id
                    ).padStart(3, "0")}`
                  }
                />

                <Info
                  label="Created"
                  value={new Date(
                    item.created_at
                  ).toLocaleString()}
                />
              </div>

              <div>
                <strong>Findings</strong>

                <p>
                  {item.findings ||
                    "No findings recorded."}
                </p>
              </div>

              <div>
                <strong>Evidence</strong>

                <p>
                  {item.evidence ||
                    "No evidence recorded."}
                </p>
              </div>

              {item.resolution && (
                <div>
                  <strong>Resolution</strong>

                  <p
                    style={{
                      color: "#22c55e",
                    }}
                  >
                    {item.resolution}
                  </p>
                </div>
              )}

              {item.status !== "RESOLVED" && (
                <button
                  onClick={() =>
                    resolveCase(item.id)
                  }
                  style={{
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "7px",
                    padding:
                      "10px 18px",
                    fontWeight: "700",
                  }}
                >
                  Resolve Investigation
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div
      style={{
        background: "#131d31",
        border: "1px solid #26344d",
        borderRadius: "12px",
        padding: "22px",
        borderLeft:
          "4px solid #3b82f6",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "800",
          marginTop: "8px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div
        style={{
          color: "#64748b",
          fontSize: "11px",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div>{value}</div>
    </div>
  );
}