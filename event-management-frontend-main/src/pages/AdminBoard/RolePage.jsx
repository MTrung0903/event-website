import React, { useState, useEffect } from 'react';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';

const RolePermissionPage = () => {
  const [activeTab, setActiveTab] = useState('Roles');
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const fetchPermissions = async () => {
    try {
      setError(null);
      if (!token) throw new Error('No token found');
      const response = await fetch('http://localhost:8080/api/permissions', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      console.log('Fetched permissions:', data);
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setPermissions([]);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <section className="p-6 space-y-6 overflow-y-auto">
      <h1 className="font-bold text-lg mb-4 select-none">Role & Permission Management</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <RoleManagement token={token} permissions={permissions} fetchPermissions={fetchPermissions} />
    </section>
  );
};

export default RolePermissionPage;