import React, { useEffect, useState } from "react";
import { activitiesAPI } from "../services/api";

const styles = {
  page: {
    padding: "30px",
    minHeight: "100vh",
    background: "#080d19",
    color: "#e5e7eb",
  },

  card: {
    background: "#131d31",
    border: "1px solid #26344d",
    borderRadius: "12px",
    padding: "22px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#080f1d",
    color: "#fff",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#3b82f6",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};

function getRiskColor(level) {
  if (level === "CRITICAL") return "#ef4444";
  if (level === "HIGH") return "#f97316";
  if (level === "MEDIUM") return "#eab308";
  return "#22c55e";
}

export default function Activities() {
  const [activities, setActivities] = useState([]);

  const [form, setForm] = useState({
    username: "employee1",
    activity_type: "FILE_ACCESS",
    resource: "Financial_Report.pdf",
    device: "Employee-PC-01",
    ip_address: "192.168.1.21",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadActivities = async () => {
    try {
      const response = await activitiesAPI.getAll();

      setActivities(
        response.data.activities || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        "Failed to load activities"
      );
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const recordActivity = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await activitiesAPI.create(form);

      const created =
        response.data.activity;

      const threat =
        response.data.threat;

      setSuccess(
        threat
          ? `Activity recorded successfully. ${threat.threat_type} detected with risk score ${threat.risk_score}/100.`
          : `Activity recorded successfully. Risk score: ${created.risk_score}/100.`
      );

      await loadActivities();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create activity"
      );
    } finally {
      setLoading(false);
    }
  };

  const total = activities.length;

  const low = activities.filter(
    (a) => Number(a.risk_score) < 30
  ).length;

  const medium = activities.filter(
    (a) =>
      Number(a.risk_score) >= 30 &&
      Number(a.risk_score) < 60
  ).length;

  const high = activities.filter(
    (a) =>
      Number(a.risk_score) >= 60 &&
      Number(a.risk_score) < 80
  ).length;

  const critical = activities.filter(
    (a) => Number(a.risk_score) >= 80
  ).length;

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={{ marginBottom: "25px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: "800",
          }}
        >
          Activity Monitoring
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginTop: "8px",
          }}
        >
          Monitor employee activities and automatically
          assess insider-threat risk.
        </p>
      </div>

      {/* SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(5, 1fr)",
          gap: "16px",
          marginBottom: "25px",
        }}
      >
        <Summary
          title="Total Activities"
          value={total}
          color="#3b82f6"
        />

        <Summary
          title="Low Risk"
          value={low}
          color="#22c55e"
        />

        <Summary
          title="Medium Risk"
          value={medium}
          color="#eab308"
        />

        <Summary
          title="High Risk"
          value={high}
          color="#f97316"
        />

        <Summary
          title="Critical"
          value={critical}
          color="#ef4444"
        />
      </div>

      {/* RECORD */}

      <div
        style={{
          ...styles.card,
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          Simulate / Record Activity
        </h2>

        <form
          onSubmit={recordActivity}
          style={{
            display: "grid",
            gridTemplateColumns:
              "1.2fr 1.2fr 1.2fr 1.2fr 1.2fr 1fr",
            gap: "14px",
            alignItems: "end",
          }}
        >

          <Field
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          <div>
            <label
              style={{
                display: "block",
                color: "#94a3b8",
                fontSize: "12px",
                marginBottom: "7px",
              }}
            >
              Activity Type
            </label>

            <select
              name="activity_type"
              value={form.activity_type}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="LOGIN">
                LOGIN
              </option>

              <option value="FILE_ACCESS">
                FILE_ACCESS
              </option>

              <option value="FAILED_LOGIN">
                FAILED_LOGIN
              </option>

              <option value="DATA_EXPORT">
                DATA_EXPORT
              </option>
            </select>
          </div>

          <Field
            label="Resource"
            name="resource"
            value={form.resource}
            onChange={handleChange}
          />

          <Field
            label="Device"
            name="device"
            value={form.device}
            onChange={handleChange}
          />

          <Field
            label="IP Address"
            name="ip_address"
            value={form.ip_address}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Recording..."
              : "Record Activity"}
          </button>

        </form>

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "14px",
              background: "#450a0a",
              border: "1px solid #991b1b",
              borderRadius: "8px",
              color: "#fecaca",
            }}
          >
            <strong>
              Backend Error:
            </strong>

            <br />

            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: "15px",
              padding: "14px",
              background: "#052e16",
              border: "1px solid #166534",
              borderRadius: "8px",
              color: "#86efac",
            }}
          >
            ✓ {success}
          </div>
        )}
      </div>

      {/* ACTIVITY TABLE */}

      <div style={styles.card}>

        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          Activity Log
        </h2>

        {activities.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "45px",
              color: "#94a3b8",
            }}
          >
            No activities recorded yet.
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
                borderCollapse: "collapse",
              }}
            >

              <thead>
                <tr>
                  <th style={th}>
                    USER
                  </th>

                  <th style={th}>
                    ACTIVITY
                  </th>

                  <th style={th}>
                    RESOURCE
                  </th>

                  <th style={th}>
                    DEVICE
                  </th>

                  <th style={th}>
                    IP ADDRESS
                  </th>

                  <th style={th}>
                    RISK
                  </th>

                  <th style={th}>
                    LEVEL
                  </th>

                  <th style={th}>
                    STATUS
                  </th>

                  <th style={th}>
                    TIME
                  </th>
                </tr>
              </thead>

              <tbody>

                {activities.map((activity) => {

                  const score =
                    Number(
                      activity.risk_score || 0
                    );

                  const level =
                    activity.risk_level ||
                    (score >= 80
                      ? "CRITICAL"
                      : score >= 60
                      ? "HIGH"
                      : score >= 30
                      ? "MEDIUM"
                      : "LOW");

                  const color =
                    getRiskColor(level);

                  return (
                    <tr key={activity.id}>

                      <td style={td}>
                        {activity.username}
                      </td>

                      <td style={td}>
                        <span
                          style={{
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            background:
                              "#3b2a0a",
                            color:
                              "#fbbf24",
                            fontSize:
                              "11px",
                            fontWeight:
                              "700",
                          }}
                        >
                          {activity.activity_type}
                        </span>
                      </td>

                      <td style={td}>
                        {activity.resource}
                      </td>

                      <td style={td}>
                        {activity.device}
                      </td>

                      <td style={td}>
                        {activity.ip_address}
                      </td>

                      <td
                        style={{
                          ...td,
                          color,
                          fontWeight: "800",
                        }}
                      >
                        {score}/100
                      </td>

                      <td
                        style={{
                          ...td,
                          color,
                          fontWeight: "800",
                        }}
                      >
                        {level}
                      </td>

                      <td style={td}>
                        {activity.status}
                      </td>

                      <td style={td}>
                        {new Date(
                          activity.created_at
                        ).toLocaleString()}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* LEGEND */}

      <div
        style={{
          ...styles.card,
          marginTop: "20px",
        }}
      >
        <strong>
          Risk Scoring:
        </strong>

        <div
          style={{
            display: "flex",
            gap: "30px",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >
          <Legend
            color="#22c55e"
            text="LOW (0–29)"
          />

          <Legend
            color="#eab308"
            text="MEDIUM (30–59)"
          />

          <Legend
            color="#f97316"
            text="HIGH (60–79)"
          />

          <Legend
            color="#ef4444"
            text="CRITICAL (80–100)"
          />
        </div>
      </div>

    </div>
  );
}


/* =====================================================
   SMALL COMPONENTS
===================================================== */

function Summary({
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        ...styles.card,
        borderLeft:
          `4px solid ${color}`,
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
          marginTop: "10px",
          fontSize: "28px",
          fontWeight: "800",
        }}
      >
        {value}
      </div>
    </div>
  );
}


function Field({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#94a3b8",
          fontSize: "12px",
          marginBottom: "7px",
        }}
      >
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        style={styles.input}
      />
    </div>
  );
}


function Legend({
  color,
  text,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color,
      }}
    >
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: color,
        }}
      />

      {text}
    </div>
  );
}


const th = {
  textAlign: "left",
  padding: "13px",
  color: "#94a3b8",
  fontSize: "11px",
  borderBottom:
    "1px solid #26344d",
};

const td = {
  padding: "14px 13px",
  borderBottom:
    "1px solid #1e293b",
  fontSize: "13px",
};