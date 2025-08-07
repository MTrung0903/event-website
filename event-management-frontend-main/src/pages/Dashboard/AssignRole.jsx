import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../Auth/AuthProvider';
import Swal from 'sweetalert2';
import 'tailwindcss/tailwind.css';
import { FaSearch, FaUser, FaCalendarAlt, FaTag, FaTrash } from 'react-icons/fa';

const AdminRoleAssignment = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [member, setMember] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [teamMembersByEvent, setTeamMembersByEvent] = useState({});
  const [error, setError] = useState(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const token = localStorage.getItem('token');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setError(null);
        if (!token) throw new Error(t('adminRoleAssignment.errorNoToken'));
        const response = await fetch('http://localhost:8080/api/roles/roles-assign', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(t('adminRoleAssignment.errorFetchRoles'));
        const data = await response.json();
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setRoles([]);
        Swal.fire({
          icon: 'error',
          title: t('adminRoleAssignment.swalErrorTitle'),
          text: err.message,
          confirmButtonColor: '#2563eb',
        });
      }
    };
    fetchRoles();
  }, [token, t]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setError(null);
        if (!token) throw new Error(t('adminRoleAssignment.errorNoToken'));
        const response = await fetch(`http://localhost:8080/api/events/get-all-event-by-org/${user.email}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(t('adminRoleAssignment.errorFetchEvents'));
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          const firstEventId = String(data[0].eventId);
          setSelectedEvent(firstEventId);
          setCurrentEventIndex(0);
          fetchTeamMembers(firstEventId);
        }
      } catch (err) {
        setError(err.message);
        setEvents([]);
        Swal.fire({
          icon: 'error',
          title: t('adminRoleAssignment.swalErrorTitle'),
          text: err.message,
          confirmButtonColor: '#2563eb',
        });
      }
    };
    fetchEvents();
  }, [user.email, token, t]);

  const searchUsers = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }
    try {
      setError(null);
      if (!token) throw new Error(t('adminRoleAssignment.errorNoToken'));
      if (!user.userId) throw new Error('Current user ID not found');
      const response = await fetch(
        `http://localhost:8080/chat/search?query=${encodeURIComponent(searchQuery)}&currentUserId=${user.userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(t('adminRoleAssignment.errorSearchUsers'));
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setIsDropdownOpen(true);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
      setIsDropdownOpen(false);
      Swal.fire({
        icon: 'error',
        title: t('adminRoleAssignment.swalErrorTitle'),
        text: err.message,
        confirmButtonColor: '#2563eb',
      });
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (member && value !== member.fullName) {
      setMember(null);
    }
    searchUsers(value);
  };

  const selectUser = (user) => {
    setMember(user);
    setQuery(user.fullName);
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const deleteAssignedRole = async (userId, roleName, eventId) => {
    const role = roles.find((r) => r.name === roleName);
    if (!role) {
      Swal.fire({
        icon: 'error',
        title: t('adminRoleAssignment.swalErrorTitle'),
        text: t('adminRoleAssignment.errorRoleNotFound'),
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    const roleId = role.roleID;

    const result = await Swal.fire({
      title: t('adminRoleAssignment.swalConfirmTitle'),
      text: t('adminRoleAssignment.swalConfirmText', { role: roleName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: t('adminRoleAssignment.swalConfirmButton'),
      cancelButtonText: t('adminRoleAssignment.swalCancelButton'),
    });

    if (result.isConfirmed) {
      try {
        setError(null);
        if (!token) throw new Error(t('adminRoleAssignment.errorNoToken'));
        const response = await fetch(
          `http://localhost:8080/api/role-assignment/delete?userId=${userId}&roleId=${roleId}&eventId=${eventId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error(t('adminRoleAssignment.errorDeleteRole'));
        const success = await response.json();
        if (success) {
          Swal.fire({
            icon: 'success',
            title: t('adminRoleAssignment.swalRoleDeletedTitle'),
            text: t('adminRoleAssignment.swalRoleDeletedText'),
            confirmButtonColor: '#2563eb',
          });
          fetchTeamMembers(selectedEvent);
        } else {
          throw new Error(t('adminRoleAssignment.errorDeleteRole'));
        }
      } catch (err) {
        setError(err.message);
        Swal.fire({
          icon: 'error',
          title: t('adminRoleAssignment.swalErrorTitle'),
          text: err.message,
          confirmButtonColor: '#2563eb',
        });
      }
    }
  };

  const assignRole = async () => {
    if (!member || !selectedRole || !selectedEvent) {
      setError(t('adminRoleAssignment.errorIncompleteSelection'));
      Swal.fire({
        icon: 'warning',
        title: t('adminRoleAssignment.swalWarningTitle'),
        text: t('adminRoleAssignment.errorIncompleteSelection'),
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    try {
      setError(null);
      if (!token) throw new Error(t('adminRoleAssignment.errorNoToken'));
      const response = await fetch('http://localhost:8080/api/role-assignment/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: member.email,
          roleId: selectedRole,
          eventId: selectedEvent,
        }),
      });
      if (!response.ok) throw new Error(t('adminRoleAssignment.errorAssignRole'));
      await response.json();
      Swal.fire({
        icon: 'success',
        title: t('adminRoleAssignment.swalRoleAssignedTitle'),
        text: t('adminRoleAssignment.swalRoleAssignedText'),
        confirmButtonColor: '#2563eb',
      });
      setQuery('');
      setMember(null);
      setSelectedRole('');
      fetchTeamMembers(selectedEvent);
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: t('adminRoleAssignment.swalErrorTitle'),
        text: err.message,
        confirmButtonColor: '#2563eb',
      });
    }
  };

  const fetchTeamMembers = async (eventId) => {
    if (!eventId) {
      console.log('No eventId provided');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      if (!token) throw new Error(t('adminRoleAssignment.errorNoToken'));
      const response = await fetch(`http://localhost:8080/api/role-assignment/${eventId}/my-team-events`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(t('adminRoleAssignment.errorFetchTeam'));
      const data = await response.json();
      setTeamMembersByEvent((prev) => ({
        ...prev,
        [eventId]: data.users || [],
      }));
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.message);
      setTeamMembersByEvent((prev) => ({
        ...prev,
        [eventId]: [],
      }));
      Swal.fire({
        icon: 'error',
        title: t('adminRoleAssignment.swalErrorTitle'),
        text: err.message,
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelection = (eventId) => {
    setSelectedEvent(String(eventId));
    if (eventId) {
      fetchTeamMembers(String(eventId));
      const eventIndex = events.findIndex((event) => String(event.eventId) === String(eventId));
      if (eventIndex !== -1) {
        setCurrentEventIndex(eventIndex);
      } else {
        setCurrentEventIndex(0);
      }
    } else {
      setCurrentEventIndex(0);
    }
  };

  const nextEvent = () => {
    if (currentEventIndex < events.length - 1) {
      const nextIndex = currentEventIndex + 1;
      const nextEventId = String(events[nextIndex].eventId);
      setCurrentEventIndex(nextIndex);
      setSelectedEvent(nextEventId);
      fetchTeamMembers(nextEventId);
    }
  };

  const prevEvent = () => {
    if (currentEventIndex > 0) {
      const prevIndex = currentEventIndex - 1;
      const prevEventId = String(events[prevIndex].eventId);
      setCurrentEventIndex(prevIndex);
      setSelectedEvent(prevEventId);
      fetchTeamMembers(prevEventId);
    }
  };

  const selectedRoleData = roles.find((role) => String(role.roleID) === String(selectedRole));
  const permissions = selectedRoleData ? selectedRoleData.permissions : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="p-4">
        <h1 className="text-3xl font-extrabold text-start tracking-tight">
          {t('adminRoleAssignment.title')}
        </h1>
      </div>

      <div className="p-6 space-y-12">
        <div className="bg-gray-50 p-8 rounded-[10px] shadow border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('adminRoleAssignment.assignRoleTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminRoleAssignment.searchMemberLabel')}</label>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-teal-500">
                <FaUser className="ml-3 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder={t('adminRoleAssignment.searchPlaceholder')}
                  className="flex-1 p-3 border-0 focus:outline-none focus:ring-0"
                />
              </div>
              {isDropdownOpen && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.userId}
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer flex justify-between items-center"
                      onClick={() => selectUser(user)}
                    >
                      <span className="text-gray-800">{user.fullName}</span>
                      <span className="text-gray-500 text-sm">{user.email}</span>
                    </div>
                  ))}
                </div>
              )}
              {member && (
                <p className="mt-2 text-sm text-teal-600 font-medium">
                  {t('adminRoleAssignment.selectedMember', { name: member.fullName, email: member.email })}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminRoleAssignment.eventLabel')}</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedEvent}
                  onChange={(e) => handleEventSelection(e.target.value)}
                  className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                >
                  <option value="">{t('adminRoleAssignment.selectEvent')}</option>
                  {events.map((event) => (
                    <option key={event.eventId} value={String(event.eventId)}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminRoleAssignment.roleLabel')}</label>
              <div className="relative">
                <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                >
                  <option value="">{t('adminRoleAssignment.selectRole')}</option>
                  {roles.map((role) => (
                    <option key={role.roleID} value={role.roleID}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('adminRoleAssignment.permissionsTitle')}</h4>
                {selectedRole && permissions.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {permissions.map((permission) => (
                      <li key={permission.permissionId} className="mb-2">
                        <span className="font-semibold">{permission.name}</span>: {permission.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    {selectedRole ? t('adminRoleAssignment.noPermissions') : t('adminRoleAssignment.noRoleSelected')}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={assignRole}
            className="w-full md:w-auto bg-gradient-to-r from-teal-400 to-teal-400 text-white px-8 py-3 rounded-lg shadow-md hover:from-teal-400 hover:to-teal-500 transition duration-300 transform hover:scale-105"
          >
            {t('adminRoleAssignment.assignRoleButton')}
          </button>
          {error && (
            <p className="mt-4 text-red-500 bg-red-50 p-3 rounded-lg text-sm">{error}</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('adminRoleAssignment.eventTeamTitle')}</h2>
          {events.length > 0 && selectedEvent ? (
            <div className="bg-gray-50 p-8 rounded-[10px] shadow border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-teal-600">
                  {events.find((event) => String(event.eventId) === String(selectedEvent))?.eventName || t('adminRoleAssignment.selectedEventPlaceholder')}
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={prevEvent}
                    disabled={currentEventIndex === 0 || isLoading}
                    className={`px-4 py-2 rounded-lg shadow-sm transition duration-200 ${
                      currentEventIndex === 0 || isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-teal-400 text-white hover:bg-teal-500'
                    }`}
                  >
                    {t('adminRoleAssignment.previousButton')}
                  </button>
                  <span className="text-gray-600 font-medium">
                    {t('adminRoleAssignment.eventPagination', { current: currentEventIndex + 1, total: events.length })}
                  </span>
                  <button
                    onClick={nextEvent}
                    disabled={currentEventIndex === events.length - 1 || isLoading}
                    className={`px-4 py-2 rounded-lg shadow-sm transition duration-200 ${
                      currentEventIndex === events.length - 1 || isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-teal-400 text-white hover:bg-teal-500'
                    }`}
                  >
                    {t('adminRoleAssignment.nextButton')}
                  </button>
                </div>
              </div>
              {isLoading ? (
                <p className="text-gray-500 text-center py-6">{t('adminRoleAssignment.loadingTeam')}</p>
              ) : teamMembersByEvent[selectedEvent] && teamMembersByEvent[selectedEvent].length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-teal-100 text-gray-900">
                        <th className="p-4 text-center font-semibold text-sm uppercase tracking-wider">
                          {t('adminRoleAssignment.tableFullName')}
                        </th>
                        <th className="p-4 text-center font-semibold text-sm uppercase tracking-wider">
                          {t('adminRoleAssignment.tableEmail')}
                        </th>
                        <th className="p-4 text-center font-semibold text-sm uppercase tracking-wider">
                          {t('adminRoleAssignment.tableRoles')}
                        </th>
                        <th className="p-4 text-center font-semibold text-sm uppercase tracking-wider">
                          {t('adminRoleAssignment.tableActions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembersByEvent[selectedEvent].map((member, index) => (
                        <tr
                          key={member.userId}
                          className={`border-b transition duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-teal-50`}
                        >
                          <td className="p-4 text-gray-800 text-center">{member.fullName}</td>
                          <td className="p-4 text-gray-600 text-center">{member.email}</td>
                          <td className="p-4 text-gray-600 text-center">
                            {member.rolesAssigned.map((roleName, idx) => (
                              <div key={idx} className="flex items-center justify-center">
                                <span>{roleName}</span>
                                <button
                                  onClick={() => deleteAssignedRole(member.userId, roleName, selectedEvent)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                  title={t('adminRoleAssignment.removeRoleTitle', { role: roleName })}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            ))}
                          </td>
                          <td className="p-4"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">
                  {t('adminRoleAssignment.noTeamMembers')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              {events.length === 0 ? t('adminRoleAssignment.noEvents') : t('adminRoleAssignment.selectEventPrompt')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRoleAssignment;