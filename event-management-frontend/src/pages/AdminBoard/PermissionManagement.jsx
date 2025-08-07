import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PermissionManagement = ({ token }) => {
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách permissions
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
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setPermissions([]);
    }
  };

  // Tạo permission mới
  const createPermission = async (permissionData) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:8080/api/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create permission');
      }
      await fetchPermissions();
    } catch (err) {
      throw err;
    }
  };

  // Cập nhật permission
  const updatePermission = async (permissionData) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:8080/api/permissions/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update permission');
      }
      await fetchPermissions();
    } catch (err) {
      throw err;
    }
  };

  // Xóa permission
  const deletePermission = async (permissionName) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8080/api/permissions/delete/${permissionName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete permission');
      }
      await fetchPermissions();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const showCreatePermissionPopup = () => {
    MySwal.fire({
      title: 'Create Permission',
      html: (
        <div>
          <label className="block text-gray-600 text-xs mb-1">Permission Name</label>
          <input
            id="permissionName"
            type="text"
            className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter permission name"
          />
          <label className="block text-gray-600 text-xs mt-4 mb-1">Description</label>
          <input
            id="description"
            type="text"
            className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter description"
          />
        </div>
      ),
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const name = document.getElementById('permissionName').value;
        const description = document.getElementById('description').value;
        if (!name.trim()) {
          MySwal.showValidationMessage('Permission name is required');
          return false;
        }
        setIsSubmitting(true);
        try {
          await createPermission({ name, description });
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

  const showEditPermissionPopup = (permission) => {
    MySwal.fire({
      title: 'Edit Permission',
      html: (
        <div>
          <label className="block text-gray-600 text-xs mb-1">Permission Name</label>
          <input
            id="permissionName"
            type="text"
            defaultValue={permission.name}
            className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter permission name"
            disabled
          />
          <label className="block text-gray-600 text-xs mt-4 mb-1">Description</label>
          <input
            id="description"
            type="text"
            defaultValue={permission.description}
            className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter description"
          />
        </div>
      ),
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const name = document.getElementById('permissionName').value;
        const description = document.getElementById('description').value;
        if (!name.trim()) {
          MySwal.showValidationMessage('Permission name is required');
          return false;
        }
        setIsSubmitting(true);
        try {
          await updatePermission({ name, description });
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

  const showDeletePermissionPopup = (permissionName) => {
    MySwal.fire({
      title: 'Delete Permission',
      text: `Are you sure you want to delete ${permissionName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setIsSubmitting(true);
        try {
          await deletePermission(permissionName);
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
          onClick={showCreatePermissionPopup}
          className="text-xs bg-blue-600 text-white rounded-full px-3 py-1 hover:bg-blue-700 disabled:bg-blue-400"
          disabled={isSubmitting}
        >
          Create Permission
        </button>
      </div>
      {permissions.length > 0 ? (
        <table className="w-full text-left text-xs text-gray-700 border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-500 font-semibold select-none">
              <th className="plceland-4 py-2">Permission Name</th>
              <th className="py-2">Description</th>
              <th className="pr-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.name} className="bg-[#f9fafb] rounded-lg">
                <td className="pl-4 py-3">{permission.name}</td>
                <td className="py-3">{permission.description}</td>
                <td className="pr-4 py-3 text-right flex gap-2 justify-end">
                  <button
                    onClick={() => showEditPermissionPopup(permission)}
                    className="text-gray-600 hover:text-yellow-600 disabled:text-gray-400"
                    title="Edit"
                    disabled={isSubmitting}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => showDeletePermissionPopup(permission.name)}
                    className="text-gray-600 hover:text-red-600 disabled:text-gray-400"
                    title="Delete"
                    disabled={isSubmitting}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-sm">No permissions available.</p>
      )}
    </div>
  );
};

export default PermissionManagement;