import React, { useEffect, useState } from "react";
import { activitiesAPI } from "../services/api";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getAll();
      setActivities(response.data.activities || response.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load activities");
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (score) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 30) return "medium";
    return "low";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Activity Monitoring</h1>
          <p>Monitor employee activity and behavioral risk</p>
        </div>

        <button onClick={loadActivities} className="refresh-btn">
          Refresh
        </button>
      </div>

      {loading && <div className="loading">Loading activities...</div>}

      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Activity</th>
                <th>Device</th>
                <th>IP Address</th>
                <th>Resource</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty">
                    No activities found
                  </td>
                </tr>
              ) : (
                activities.map((activity) => {
                  const score = activity.risk_score || 0;

                  return (
                    <tr key={activity.id}>
                      <td>
                        {activity.created_at
                          ? new Date(activity.created_at).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        {activity.username ||
                          activity.user?.username ||
                          activity.user_id ||
                          "-"}
                      </td>

                      <td>
                        <span className="activity-badge">
                          {activity.activity_type || activity.type}
                        </span>
                      </td>

                      <td>{activity.device_name || "-"}</td>

                      <td>{activity.ip_address || "-"}</td>

                      <td>{activity.resource || "-"}</td>

                      <td>
                        <span className={`risk ${getRiskClass(score)}`}>
                          {score}
                        </span>
                      </td>

                      <td>
                        <span className="status-badge">
                          {activity.status || "NORMAL"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Activities;