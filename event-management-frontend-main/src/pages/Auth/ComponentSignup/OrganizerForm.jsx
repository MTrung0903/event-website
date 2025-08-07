import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import BackIcon from "./BackIcon";
import Swal from 'sweetalert2';
import { useTranslation } from "react-i18next";

const OrganizerForm = ({ email, userData, onComplete, onPrev }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    organizerName: '',
    organizerAddress: '',
    organizerWebsite: '',
    organizerPhone: '',
    fullName: '',
    email: email,
    password: userData.password || '',
    gender: '',
    birthday: '',
    address: '',
  });
  const [openSection, setOpenSection] = useState('personal');
  const [errors, setErrors] = useState({});

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName) newErrors.fullName = t('organizerForm.errors.fullNameRequired');
    else if (!/^[a-zA-Z\s]+$/.test(data.fullName)) newErrors.fullName = t('organizerForm.errors.fullNameInvalid');

    if (!data.password) newErrors.password = t('organizerForm.errors.passwordRequired');
    else if (data.password.length < 8) newErrors.password = t('organizerForm.errors.passwordTooShort');

    if (!data.gender) newErrors.gender = t('organizerForm.errors.genderRequired');
    if (!data.birthday) newErrors.birthday = t('organizerForm.errors.birthdayRequired');
    if (!data.address) newErrors.address = t('organizerForm.errors.addressRequired');

    if (!data.organizerName) newErrors.organizerName = t('organizerForm.errors.organizerNameRequired');
    if (!data.organizerAddress) newErrors.organizerAddress = t('organizerForm.errors.organizerAddressRequired');
    if (!data.organizerWebsite) newErrors.organizerWebsite = t('organizerForm.errors.organizerWebsiteRequired');
    if (!data.organizerPhone) newErrors.organizerPhone = t('organizerForm.errors.organizerPhoneRequired');
    else if (!/^\d{10}$/.test(data.organizerPhone)) newErrors.organizerPhone = t('organizerForm.errors.organizerPhoneInvalid');

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const fieldErrors = validateForm({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        birthday: formData.birthday,
        gender: formData.gender,
        address: formData.address,
        organizer: {
          organizerName: formData.organizerName,
          organizerAddress: formData.organizerAddress,
          organizerWebsite: formData.organizerWebsite,
          organizerPhone: formData.organizerPhone
        }
      };
      console.log(payload);
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Swal.fire({
        icon: 'success',
        title: t('organizerForm.success.title'),
        text: t('organizerForm.success.text'),
      });
      onComplete();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('organizerForm.errors.title'),
        text: t('organizerForm.errors.registrationFailed'),
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-[600px] mx-auto p-6">
        <ProgressBar currentStep={5} />
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-[600px]">
          <div className="p-6 rounded-t">
            <h2 className="text-2xl font-bold flex items-center">
              <BackIcon onClick={onPrev} />
              {t('organizerForm.title')}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'personal' ? '' : 'personal')}
                className="w-full text-left font-semibold text-gray-700 flex justify-between items-center hover:bg-gray-100 p-2 rounded transition-colors duration-200"
              >
                {t('organizerForm.sections.personal')}
                <svg
                  className={`w-5 h-5 transform ${openSection === 'personal' ? 'rotate-180' : ''} transition-transform duration-200`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === 'personal' && (
                <div className="mt-4 animate-slide-down">
                  <div className="-mx-3 md:flex mb-4">
                    <div className="md:w-1/2 px-3">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="email"
                      >
                        {t('organizerForm.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-3 px-4"
                        id="email"
                        aria-label={t('organizerForm.email')}
                      />
                    </div>
                    <div className="md:w-1/2 px-3 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="role"
                      >
                        {t('organizerForm.role')}
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={t('organizerForm.roleValue')}
                        disabled
                        className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-3 px-4 mb-3"
                        id="org-role"
                        aria-label={t('organizerForm.role')}
                      />
                    </div>
                  </div>
                  <div className="-mx-3 md:flex mb-4">
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="full-name"
                      >
                        {t('organizerForm.fullName')}
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
                        aria-label={t('organizerForm.fullName')}
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
                        {t('organizerForm.birthday')}
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
                        aria-label={t('organizerForm.birthday')}
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
                        {t('organizerForm.password')}
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
                        aria-label={t('organizerForm.password')}
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
                        {t('organizerForm.gender')}
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
                        aria-label={t('organizerForm.gender')}
                      >
                        <option value="">{t('organizerForm.genderOptions.select')}</option>
                        <option value="male">{t('organizerForm.genderOptions.male')}</option>
                        <option value="female">{t('organizerForm.genderOptions.female')}</option>
                        <option value="other">{t('organizerForm.genderOptions.other')}</option>
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
                        {t('organizerForm.address')}
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder={t('organizerForm.placeholders.address')}
                        className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 ${
                          errors.address ? "border-red-500" : "border-gray-400"
                        }`}
                        id="address"
                        required
                        aria-label={t('organizerForm.address')}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'organizer' ? '' : 'organizer')}
                className="w-full text-left font-semibold text-gray-700 flex justify-between items-center hover:bg-gray-100 p-2 rounded transition-colors duration-200"
              >
                {t('organizerForm.sections.organizer')}
                <svg
                  className={`w-5 h-5 transform ${openSection === 'organizer' ? 'rotate-180' : ''} transition-transform duration-200`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === 'organizer' && (
                <div className="mt-4 animate-slide-down">
                  <div className="-mx-3 md:flex mb-6">
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="organizer-name"
                      >
                        {t('organizerForm.organizerName')}
                      </label>
                      <input
                        type="text"
                        name="organizerName"
                        value={formData.organizerName}
                        onChange={handleChange}
                        placeholder={t('organizerForm.placeholders.organizerName')}
                        className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 ${
                          errors.organizerName ? "border-red-500" : "border-gray-400"
                        }`}
                        id="organizer-name"
                        required
                        aria-label={t('organizerForm.organizerName')}
                      />
                      {errors.organizerName && (
                        <p className="text-red-500 text-xs">{errors.organizerName}</p>
                      )}
                    </div>
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="organizer-website"
                      >
                        {t('organizerForm.organizerWebsite')}
                      </label>
                      <input
                        type="url"
                        name="organizerWebsite"
                        value={formData.organizerWebsite}
                        onChange={handleChange}
                        placeholder={t('organizerForm.placeholders.website')}
                        className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 ${
                          errors.organizerWebsite ? "border-red-500" : "border-gray-400"
                        }`}
                        id="organizer-website"
                        required
                        aria-label={t('organizerForm.organizerWebsite')}
                      />
                      {errors.organizerWebsite && (
                        <p className="text-red-500 text-xs">{errors.organizerWebsite}</p>
                      )}
                    </div>
                  </div>
                  <div className="-mx-3 md:flex mb-6">
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="organizer-address"
                      >
                        {t('organizerForm.addressLabel')}
                      </label>
                      <input
                        type="text"
                        name="organizerAddress"
                        value={formData.organizerAddress}
                        onChange={handleChange}
                        placeholder={t('organizerForm.placeholders.organizerAddress')}
                        className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 ${
                          errors.organizerAddress ? "border-red-500" : "border-gray-400"
                        }`}
                        id="organizer-address"
                        required
                        aria-label={t('organizerForm.addressLabel')}
                      />
                      {errors.organizerAddress && (
                        <p className="text-red-500 text-xs">{errors.organizerAddress}</p>
                      )}
                    </div>
                    <div className="md:w-1/2 px-3">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="organizer-phone"
                      >
                        {t('organizerForm.phone')}
                      </label>
                      <input
                        type="tel"
                        name="organizerPhone"
                        value={formData.organizerPhone}
                        onChange={handleChange}
                        placeholder={t('organizerForm.placeholders.phone')}
                        className={`appearance-none block w-full text-gray-700 border rounded py-3 px-4 ${
                          errors.organizerPhone ? "border-red-500" : "border-gray-400"
                        }`}
                        id="organizer-phone"
                        required
                        aria-label={t('organizerForm.organizerPhone')}
                      />
                      {errors.organizerPhone && (
                        <p className="text-red-500 text-xs">{errors.organizerPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-500 text-white p-3 rounded-lg hover:scale-105 transition-transform duration-200"
            >
              {t('organizerForm.buttons.complete')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizerForm;