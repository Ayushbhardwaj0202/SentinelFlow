import React, { useEffect, useState } from 'react';
import { sessionsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await sessionsAPI.getAll();
        setSessions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="fade-in">
      <PageHeader title="Network Sessions" subtitle="Active and historical sessions" />
      
      {loading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <EmptyState message="No sessions found" icon="🔗" />
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td>{session.id.substring(0, 8)}...</td>
                    <td>{session.User ? session.User.username : session.user_id}</td>
                    <td>{session.ip_address}</td>
                    <td><StatusBadge status={session.status} /></td>
                    <td>{new Date(session.start_time).toLocaleString()}</td>
                    <td>{session.end_time ? new Date(session.end_time).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
