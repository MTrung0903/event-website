import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import BackIcon from "./BackIcon";
import { useTranslation } from "react-i18next";

const AttendeeForm = ({ email, userData, onComplete, onPrev }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: email,
    password: userData.password || '',
    gender: '',
    birthday: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName) newErrors.fullName = t('attendeeForm.errors.fullNameRequired');
    else if (!/^[a-zA-Z\s]+$/.test(data.fullName)) newErrors.fullName = t('attendeeForm.errors.fullNameInvalid');

    if (!data.password) newErrors.password = t('attendeeForm.errors.passwordRequired');
    else if (data.password.length < 8) newErrors.password = t('attendeeForm.errors.passwordTooShort');

    if (!data.gender) newErrors.gender = t('attendeeForm.errors.genderRequired');
    if (!data.birthday) newErrors.birthday = t('attendeeForm.errors.birthdayRequired');
    if (!data.address) newErrors.address = t('attendeeForm.errors.addressRequired');

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const fieldErrors = validateForm({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-[600px] mx-auto p-6">
        <ProgressBar currentStep={5} totalSteps={6} />
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-[600px]">
          <div className="p-6 rounded-t">
            <h2 className="text-2xl font-bold flex items-center">
              <BackIcon onClick={onPrev} />
              {t('attendeeForm.title')}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mt-4 animate-slide-down">
              <div className="-mx-3 md:flex mb-4">
                <div className="md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="email"
                  >
                    {t('attendeeForm.labels.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-3 px-4"
                    id="email"
                    aria-label={t('attendeeForm.labels.email')}
                  />
                </div>
                <div className="md:w-1/2 px-3 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="role"
                  >
                    {t('attendeeForm.labels.role')}
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={t('attendeeForm.roleValue')}
                    disabled
                    className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-3 px-4 mb-3"
                    id="role"
                    aria-label={t('attendeeForm.labels.role')}
                  />
                </div>
              </div>
              <div className="-mx-3 md:flex mb-4">
                <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="full-name"
                  >
                    {t('attendeeForm.labels.fullName')}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 ${
                      errors.fullName ? "border-red-500" : "border-gray-400"
                    }`}
                    id="full-name"
                    required
                    aria-label={t('attendeeForm.labels.fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs">{errors.fullName}</p>
                  )}
                </div>
                <div className="md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="birthday"
                  >
                    {t('attendeeForm.labels.birthday')}
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 ${
                      errors.birthday ? "border-red-500" : "border-gray-400"
                    }`}
                    id="birthday"
                    required
                    aria-label={t('attendeeForm.labels.birthday')}
                  />
                  {errors.birthday && (
                    <p className="text-red-500 text-xs">{errors.birthday}</p>
                  )}
                </div>
              </div>
              <div className="-mx-3 md:flex mb-4">
                <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="password"
                  >
                    {t('attendeeForm.labels.password')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 ${
                      errors.password ? "border-red-500" : "border-gray-400"
                    }`}
                    id="password"
                    disabled
                    aria-label={t('attendeeForm.labels.password')}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">{errors.password}</p>
                  )}
                </div>
                <div className="md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="gender"
                  >
                    {t('attendeeForm.labels.gender')}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 ${
                      errors.gender ? "border-red-500" : "border-gray-400"
                    }`}
                    id="gender"
                    required
                    aria-label={t('attendeeForm.labels.gender')}
                  >
                    <option value="">{t('attendeeForm.genderOptions.select')}</option>
                    <option value="male">{t('attendeeForm.genderOptions.male')}</option>
                    <option value="female">{t('attendeeForm.genderOptions.female')}</option>
                    <option value="other">{t('attendeeForm.genderOptions.other')}</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs">{errors.gender}</p>
                  )}
                </div>
              </div>
              <div className="-mx-3 md:flex mb-4">
                <div className="md:w-full px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="address"
                  >
                    {t('attendeeForm.labels.address')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t('attendeeForm.placeholders.address')}
                    className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 ${
                      errors.address ? "border-red-500" : "border-gray-400"
                    }`}
                    id="address"
                    required
                    aria-label={t('attendeeForm.labels.address')}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-500 text-white p-3 rounded-lg hover:scale-105 transition-transform duration-200"
            >
              {t('attendeeForm.buttons.continue')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendeeForm;