import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const RoleManagement = ({ token, permissions, fetchPermissions }) => {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách roles
  const fetchRoles = async () => {
    try {
      setError(null);
      if (!token) throw new Error('No token found');
      const response = await fetch('http://localhost:8080/api/roles/ADMIN/created', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
      setRoles([]);
    }
  };

  // Tạo role mới
  const createRole = async (roleData) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:8080/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create role');
      }
      await fetchRoles();
    } catch (err) {
      throw err;
    }
  };

  

  // Xóa role
  const deleteRole = async (roleName) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8080/api/roles/delete/${roleName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete role');
      }
      await fetchRoles();
    } catch (err) {
      throw err;
    }
  };

  // Gán permissions cho role
  const assignPermissionsToRole = async (roleId, permissionNames) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8080/api/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(permissionNames),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign permissions');
      }
      await fetchRoles();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const showCreateRolePopup = () => {
    MySwal.fire({
      title: 'Create Role',
      html: (
        <div>
          <label className="block text-gray-600 text-xs mb-1">Role Name</label>
          <input
            id="roleName"
            type="text"
            className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter role name"
          />
        </div>
      ),
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const name = document.getElementById('roleName').value;
        if (!name.trim()) {
          MySwal.showValidationMessage('Role name is required');
          return false;
        }
        setIsSubmitting(true);
        try {
          await createRole({ name });
          return true;
        } catch (err) {
          MySwal.showValidationMessage(err.message);
          return false;
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

 

  const showDeleteRolePopup = (roleName) => {
    MySwal.fire({
      title: 'Delete Role',
      text: `Are you sure you want to delete ${roleName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setIsSubmitting(true);
        try {
          await deleteRole(roleName);
          return true;
        } catch (err) {
          MySwal.showValidationMessage(err.message);
          return false;
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const showAssignPermissionsPopup = (roleId) => {
    const role = roles.find((r) => r.roleID === roleId);
    MySwal.fire({
      title: 'Assign Permissions to Role',
      html: (
        <div>
          <label className="block text-gray-600 text-xs mb-1">Role Name</label>
          <input
            type="text"
            value={role ? role.name : ''}
            className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
            disabled
          />
          <label className="block text-gray-600 text-xs mt-4 mb-1">Select Permissions</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
            {permissions.map((perm) => (
              <div key={perm.name} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  defaultChecked={role.permissions.some((p) => p.name === perm.name)}
                  onChange={(e) => {
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    const permissions = Array.from(checkboxes)
                      .filter((cb) => cb.checked)
                      .map((cb) => cb.value);
                    document.getElementById('permissions').value = JSON.stringify(permissions);
                  }}
                  value={perm.name}
                  className="mr-2"
                />
                <span className="text-sm">{perm.name}</span>
              </div>
            ))}
            <input type="hidden" id="permissions" />
          </div>
        </div>
      ),
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const permissions = JSON.parse(document.getElementById('permissions').value || '[]');
        setIsSubmitting(true);
        try {
          await assignPermissionsToRole(roleId, permissions);
          return true;
        } catch (err) {
          MySwal.showValidationMessage(err.message);
          return false;
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="flex justify-between items-center mb-4">
       
        <button
          onClick={showCreateRolePopup}
          className="text-xs bg-blue-600 text-white rounded-full px-3 py-1 hover:bg-blue-700 disabled:bg-blue-400"
          disabled={isSubmitting}
        >
          Create Role
        </button>
      </div>
      {roles.length > 0 ? (
        roles.map((role) => (
          <div key={role.roleID} className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-sm text-gray-800">{role.name.replace('ROLE_', '')}</h2>
              <div className="flex gap-2">
                
                <button
                  onClick={() => showDeleteRolePopup(role.name)}
                  className="text-xs bg-red-600 text-white rounded-full px-3 py-1 hover:bg-red-700 disabled:bg-red-400"
                  disabled={isSubmitting}
                >
                  Delete
                </button>

              </div>
            </div>
            
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No roles available.</p>
      )}
    </div>
  );
};

export default RoleManagement;