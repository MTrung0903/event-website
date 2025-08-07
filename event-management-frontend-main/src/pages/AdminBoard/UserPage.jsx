import React, { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import UserEditPopup from './UserEditPopup';
import { FaUserFriends, FaUsers } from "react-icons/fa";
import Swal from 'sweetalert2';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [filterRole, setFilterRole] = useState(null); // Trạng thái lọc theo vai trò
  const token = localStorage.getItem('token');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setError(null);
      if (!token) throw new Error('No token found');
      const response = await fetch('http://localhost:8080/api/auth/users', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setError(null);
      if (!token) throw new Error('No token found');
      const response = await fetch('http://localhost:8080/api/roles/ADMIN/created', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const openPopup = (type, user = null) => {
    setPopupType(type);
    setSelectedUser(user);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupType(null);
    setSelectedUser(null);
  };

  // Handle row click to show or hide tooltip
  const handleRowClick = (user) => {
    if (selectedUser && selectedUser.userId === user.userId) {
      setShowTooltip(false);
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
      setShowTooltip(true);
    }
  };

  // Handle filter by role
  const handleFilterRole = (roleName) => {
    setFilterRole(roleName);
  };

  // Filter users based on selected role
  const filteredUsers = filterRole
    ? users.filter((user) => user.roles.some((r) => r.name === filterRole))
    : users;

  // Statistics
  const totalUsers = users.length;
  const roleStats = roles.reduce((acc, role) => {
    acc[role.name] = users.filter((user) =>
      user.roles.some((r) => r.name === role.name)
    ).length;
    return acc;
  }, {});
const lockUser = async (email) => {
  try {
    const response = await fetch(`http://localhost:8080/api/auth/users/${email}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể khóa tài khoản');
    Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: data.message || 'Tài khoản đã được khóa thành công',
    });
    fetchUsers(); // Cập nhật danh sách người dùng
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: err.message || 'Không thể khóa tài khoản',
    });
  }
};

const unlockUser = async (email) => {
  try {
    const response = await fetch(`http://localhost:8080/api/auth/users/${email}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể mở khóa tài khoản');
    Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: data.message || 'Tài khoản đã được mở khóa thành công',
    });
    fetchUsers(); // Cập nhật danh sách người dùng
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: err.message || 'Không thể mở khóa tài khoản',
    });
  }
};
  return (
    <section className="p-6 space-y-6 overflow-y-auto">
      <h1 className="mb-4 text-2xl font-bold select-none">User Management Dashboard</h1>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6 md:grid-cols-5">
        <div
          className="bg-white rounded-xl p-4 border border-gray-200 w-[200px] cursor-pointer hover:bg-gray-100"
          onClick={() => handleFilterRole(null)}
        >
          <h3 className="text-sm font-semibold text-gray-700">Total Users</h3>
          <div className="flex items-center gap-4 p-2 space-x-2">
            <FaUserFriends />
            <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
          </div>
        </div>
        {roles.map((role) => (
          <div
            key={role.name}
            className="bg-[#ECEAE4] rounded-xl p-4 shadow-md w-[200px] cursor-pointer hover:bg-gray-200"
            onClick={() => handleFilterRole(role.name)}
          >
            <h3 className="text-[12px] font-semibold text-gray-700 font-montserrat">
              {role.name.replace('ROLE_', '')}
            </h3>
            <div className="flex items-center gap-4 p-2 space-x-2">
              <FaUsers />
              <p className="text-2xl font-bold text-blue-600">{roleStats[role.name] || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User list */}
      <div className="p-6 bg-white rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">User List</h2>
          <button
            onClick={() => openPopup('createUser')}
            className="px-3 py-1 text-xs text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-blue-400"
          >
            Create User
          </button>
        </div>
        {filteredUsers.length > 0 ? (
          <table className="w-full text-xs text-left text-gray-700 border-separate border-spacing-y-2">
            <thead>
              <tr className="font-semibold text-gray-500 select-none">
                <th className="py-2 pl-4">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Roles</th>
                <th className="py-2">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className="bg-[#f9fafb] rounded-lg cursor-pointer"
                    onClick={() => handleRowClick(user)}
                    data-tooltip-id={`user-tooltip-${user.userId}`}
                  >
                    <td className="py-3 pl-4 font-semibold">{user.fullName}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">{user.roles.map((r) => r.name.replace('ROLE_', '')).join(', ')}</td>
                    <td className="py-3">{user.active ? 'Hoạt động' : 'Bị khóa'}</td>
                    <td className="py-3 pr-4 text-right">
                      {user.fullName.toLowerCase() !== 'admin' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            title="Edit"
                            onClick={(e) => { e.stopPropagation(); openPopup('editUser', user); }}
                            className="text-gray-600 hover:text-yellow-600 disabled:text-gray-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); openPopup('deleteUser', user); }}
                            className="text-gray-600 hover:text-red-600 disabled:text-gray-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            title="Add Role"
                            onClick={(e) => { e.stopPropagation(); openPopup('addRole', user); }}
                            className="text-gray-600 hover:text-blue-600 disabled:text-gray-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button
                            title="Remove Role"
                            onClick={(e) => { e.stopPropagation(); openPopup('removeRole', user); }}
                            className="text-gray-600 hover:text-red-600 disabled:text-gray-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          {!user.roles.some((r) => r.name === 'ROLE_ORGANIZER') && (
                            <button
                              title="Upgrade to Organizer"
                              onClick={(e) => { e.stopPropagation(); openPopup('upgradeOrganizer', user); }}
                              className="text-gray-600 hover:text-green-600 disabled:text-gray-400"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeство
              Width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                              </svg>
                            </button>
                          )}
                          {user.active ? (
                            <button
                              title="Khóa tài khoản"
                              onClick={(e) => { e.stopPropagation(); lockUser(user.email); }}
                              className="text-gray-600 hover:text-red-600 disabled:text-gray-400"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-1m0-3v-2m-4 2h4m6 0c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              title="Mở khóa tài khoản"
                              onClick={(e) => { e.stopPropagation(); unlockUser(user.email); }}
                              className="text-gray-600 hover:text-green-600 disabled:text-gray-400"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 018 0v4m-4 4v-4m-4 4h4m6 0c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end invisible gap-2">
                          {/* Placeholder để giữ chiều rộng cột */}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No users available.</p>
        )}

        {/* Tooltip for User Details */}
        {selectedUser && selectedUser.fullName.toLowerCase() !== 'admin' && (
          <Tooltip
            id={`user-tooltip-${selectedUser.userId}`}
            place="right"
            effect="solid"
            isOpen={showTooltip}
            clickable={true}
            className="bg-[#f9fafb] rounded-lg p-4 shadow-lg max-w-sm z-50"
            afterHide={() => setShowTooltip(false)}
          >
            <h3 className="text-sm font-bold select-none">User Details</h3>
            <p><strong>Name:</strong> {selectedUser.fullName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Roles:</strong> {selectedUser.roles.map((r) => r.name.replace('ROLE_', '')).join(', ')}</p>
            <p><strong>Status:</strong> {selectedUser.active ? 'Active' : 'Inactive'}</p>
            {selectedUser.organizer && (
              <div>
                <p><strong>Organizer Name:</strong> {selectedUser.organizer.organizerName}</p>
                <p><strong>Organizer Address:</strong> {selectedUser.organizer.organizerAddress || 'N/A'}</p>
                <p><strong>Organizer Website:</strong> {selectedUser.organizer.organizerWebsite || 'N/A'}</p>
                <p><strong>Organizer Phone:</strong> {selectedUser.organizer.organizerPhone || 'N/A'}</p>
                <p><strong>Organizer Description:</strong> {selectedUser.organizer.organizerDesc || 'N/A'}</p>
              </div>
            )}
          </Tooltip>
        )}

        {/* Render Popup */}
        {showPopup && (
          <UserEditPopup
            popupType={popupType}
            selectedUser={selectedUser}
            roles={roles}
            token={token}
            onClose={closePopup}
            onSubmitSuccess={fetchUsers}
            setError={setError}
          />
        )}
      </div>
    </section>
  );
};

export default UserPage;