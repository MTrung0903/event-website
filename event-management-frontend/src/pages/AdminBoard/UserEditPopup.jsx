import React from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';

const UserEditPopup = ({ popupType, selectedUser, roles, token, onClose, onSubmitSuccess, setError }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      gender: '',
      birthday: '',
      address: '',
      roles: [],
      role: '',
      organizerName: '',
      organizerAddress: '',
      organizerWebsite: '',
      organizerPhone: '',
      organizerDesc: '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (popupType === 'editUser' && selectedUser) {
      reset({
        fullName: selectedUser.fullName || '',
        email: selectedUser.email || '',
        password: '',
        gender: selectedUser.gender || '',
        birthday: selectedUser.birthday || '',
        address: selectedUser.address || '',
        roles: selectedUser.roles ? selectedUser.roles.map((role) => role.name) : [],
      });
    } else if (popupType === 'upgradeOrganizer' && selectedUser) {
      reset({
        organizerName: '',
        organizerAddress: '',
        organizerWebsite: '',
        organizerPhone: '',
        organizerDesc: '',
      });
    } else if (popupType === 'addRole' || popupType === 'removeRole') {
      reset({ role: '' });
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        gender: '',
        birthday: '',
        address: '',
        roles: [],
      });
    }
  }, [popupType, selectedUser, reset]);

  // Create user
  const createUser = async (userData) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    } catch (err) {
      throw err;
    }
  };

  // Update user
  const updateUser = async (userData) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/save-change', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
    } catch (err) {
      throw err;
    }
  };

  // Delete user
  const deleteUser = async (email) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/users/${email}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (err) {
      throw err;
    }
  };

  // Add role to user
  const addRoleToUser = async (email, roleName) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/${email}/add-new-role/${roleName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add role');
      }
    } catch (err) {
      throw err;
    }
  };

  // Remove role from user
  const removeRoleFromUser = async (email, roleName) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/${email}/remove-role/${roleName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove role');
      }
    } catch (err) {
      throw err;
    }
  };

  // Upgrade to organizer
  const upgradeToOrganizer = async (email, organizerData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/user/upgrade-organizer/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(organizerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upgrade to organizer');
      }
    } catch (err) {
      throw err;
    }
  };

  const onSubmit = async (data) => {
    if (popupType === 'deleteUser' && !selectedUser?.email) return;
    setIsSubmitting(true);
    try {
      if (popupType === 'createUser') {
        await createUser({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          gender: data.gender,
          birthday: data.birthday,
          address: data.address,
          roles: data.roles.map((name) => ({ name })),
        });
      } else if (popupType === 'editUser') {
        await updateUser({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          gender: data.gender,
          birthday: data.birthday,
          address: data.address,
          roles: data.roles.map((name) => ({ name })),
        });
      } else if (popupType === 'deleteUser') {
        await deleteUser(selectedUser.email);
      } else if (popupType === 'addRole') {
        if (data.role) {
          await addRoleToUser(selectedUser.email, data.role);
        }
      } else if (popupType === 'removeRole') {
        if (data.role) {
          await removeRoleFromUser(selectedUser.email, data.role);
        }
      } else if (popupType === 'upgradeOrganizer') {
        await upgradeToOrganizer(selectedUser.email, {
          organizerName: data.organizerName,
          organizerAddress: data.organizerAddress,
          organizerWebsite: data.organizerWebsite,
          organizerPhone: data.organizerPhone,
          organizerDesc: data.organizerDesc,
        });
      }
      onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <h3 className="font-bold text-sm mb-4 select-none">
          {popupType === 'createUser' && 'Create User'}
          {popupType === 'editUser' && 'Edit User'}
          {popupType === 'deleteUser' && 'Delete User'}
          {popupType === 'addRole' && 'Add Role to User'}
          {popupType === 'removeRole' && 'Remove Role from User'}
          {popupType === 'upgradeOrganizer' && 'Upgrade to Organizer'}
        </h3>
        {(popupType === 'createUser' || popupType === 'editUser') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Full Name</label>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Email</label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter email"
                    disabled={isSubmitting || popupType === 'editUser'}
                  />
                )}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Password</label>
              <Controller
                name="password"
                control={control}
                rules={popupType === 'createUser' ? { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } } : {}}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter password"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Gender</label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.gender ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Birthday</label>
              <Controller
                name="birthday"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.birthday ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Address</label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.address ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter address"
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            
          </div>
        )}
        {(popupType === 'addRole' || popupType === 'removeRole') && (
          <div className="mb-4">
            <label className="block text-gray-600 text-xs mb-1">Select Role</label>
            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.role ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                  disabled={isSubmitting}
                >
                  <option value="">Select a role</option>
                  {roles
                    .filter((role) => popupType === 'addRole' || selectedUser?.roles.some((r) => r.name === role.name))
                    .map((role) => (
                      <option key={role.name} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                </select>
              )}
            />
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
        )}
        {popupType === 'deleteUser' && (
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <span className="font-semibold">{selectedUser?.email}</span>?
          </p>
        )}
        {popupType === 'upgradeOrganizer' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Organizer Name</label>
              <Controller
                name="organizerName"
                control={control}
                rules={{ required: 'Organizer name is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.organizerName ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter organizer name"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.organizerName && <p className="text-red-500 text-xs mt-1">{errors.organizerName.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Organizer Address</label>
              <Controller
                name="organizerAddress"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.organizerAddress ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter organizer address"
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Organizer Website</label>
              <Controller
                name="organizerWebsite"
                control={control}
                rules={{
                  pattern: {
                    value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i,
                    message: 'Invalid website URL',
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.organizerWebsite ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter organizer website"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.organizerWebsite && <p className="text-red-500 text-xs mt-1">{errors.organizerWebsite.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Organizer Phone</label>
              <Controller
                name="organizerPhone"
                control={control}
                rules={{
                  pattern: {
                    value: /^\+?[\d\s-]{10,}$/,
                    message: 'Invalid phone number',
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.organizerPhone ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter organizer phone"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.organizerPhone && <p className="text-red-500 text-xs mt-1">{errors.organizerPhone.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-xs mb-1">Organizer Description</label>
              <Controller
                name="organizerDesc"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className={`w-full p-2 bg-gray-100 border rounded-md text-sm focus:outline-none focus:ring-2 ${errors.organizerDesc ? 'border-red-500' : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Enter organizer description"
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 disabled:bg-gray-300 disabled:text-gray-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isSubmitting ? 'Submitting...' : popupType === 'deleteUser' ? 'Delete' : 'Submit'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserEditPopup;