import React, { useEffect, useState } from 'react';
import { devicesAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await devicesAPI.getAll();
      setDevices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="fade-in">
      <PageHeader title="Devices" subtitle="Manage registered devices" />
      
      {loading ? (
        <LoadingSpinner />
      ) : devices.length === 0 ? (
        <EmptyState message="No devices registered" icon="💻" />
      ) : (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {devices.map(device => (
            <div key={device.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{device.hostname || 'Unknown Device'}</h3>
                <StatusBadge status={device.status} />
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Type</span>
                  <span>{device.device_type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">OS</span>
                  <span>{device.os_version || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">IP Address</span>
                  <span>{device.ip_address || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Owner ID</span>
                  <span>{device.owner_id || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Last Seen</span>
                  <span>{device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Devices;
