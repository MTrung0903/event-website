import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BackIcon from './BackIcon';
import ProgressBar from './ProgressBar';
import Loader from '../../../components/Loading';
import Swal from 'sweetalert2';

const PreferenceStep = ({ email, userData, onComplete, onPrev }) => {
  const { t } = useTranslation(); // Hook to access translations
  const [preferredEventTypes, setPreferredEventTypes] = useState([]);
  const [preferredTags, setPreferredTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const token = localStorage.getItem("token");

  const eventTypes = [
    'Music',
    'Nightlife',
    'Performing',
    'Holidays',
    'Dating',
    'Hobbies',
    'Business',
    'Food & Drink',
    'Conference',
  ];

  // Hàm lấy danh sách tag từ API
  const handleGetTags = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await fetch('http://localhost:8080/api/events/search/all-tags', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data); // Lưu danh sách tag từ API
    } catch (err) {
      setApiError(err.message);
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    handleGetTags();
  }, []);

  // Xử lý chọn/bỏ chọn event type hoặc tag
  const handlePreferenceToggle = (field, value) => {
    if (field === 'preferredEventTypes') {
      setPreferredEventTypes((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else if (field === 'preferredTags') {
      setPreferredTags((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }

    // Xóa lỗi nếu có lựa chọn
    if (preferredEventTypes.length > 0 || preferredTags.length > 0) {
      setErrors((prev) => ({ ...prev, preferences: '' }));
    }
  };

  // Kiểm tra dữ liệu trước khi submit
  const validatePreferences = () => {
    const newErrors = {};
    if (preferredEventTypes.length === 0 && preferredTags.length === 0) {
      newErrors.preferences = t('preferenceStep.validationError');
    }
    return newErrors;
  };

  // Xử lý submit form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validatePreferences();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        fullName: userData.fullName,
        email: email,
        password: userData.password,
        birthday: userData.birthday,
        gender: userData.gender,
        address: userData.address,
        preferredEventTypes,
        preferredTags,
      };

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      Swal.fire({
        icon: 'success',
        title: t('organizerForm.success.successTitle'), // Reuse existing success title
        text: t('organizerForm.success.success'), // Reuse existing success message
      });
      onComplete();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('organizerForm.errors.errorTitle'), // Reuse existing error title
        text: t('organizerForm.errors.registrationError'), // Reuse existing error message
      });
    }
  };

  return (
    <div className="bg-[#fcbfb5] min-h-screen flex items-center justify-center p-6">
      <div className="max-w-7xl w-full flex flex-col md:flex-row gap-10 md:gap-20">
        <div className="bg-white rounded-lg p-10 max-w-3xl w-full md:w-[650px] flex flex-col gap-4">
          <ProgressBar currentStep={6} totalSteps={6} />
          <h1 className="text-[#1a1a2e] font-montserrat font-extrabold text-3xl leading-tight flex items-center">
            <BackIcon onClick={onPrev} />
            {t('preferenceStep.title')}
          </h1>
          <p className="text-[#1a1a2e] font-montserrat text-sm leading-relaxed max-w-xl">
            {t('preferenceStep.description')}
          </p>

          {/* Phần chọn Event Types */}
          <label
            className="text-[#1a1a2e] font-montserrat font-semibold text-sm mt-6 block"
            htmlFor="event-types"
          >
            {t('preferenceStep.eventTypesLabel')}
            <span className="text-red-600">{t('preferenceStep.requiredField')}</span>
          </label>
          <div className="flex flex-wrap gap-4 max-w-xl mt-2" id="event-types">
            {eventTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`font-montserrat rounded-full px-5 py-2 text-[11px] font-normal transition ${
                  preferredEventTypes.includes(type)
                    ? 'bg-[#d3d2df] text-[#1a1a2e] font-semibold'
                    : 'bg-[#e6e6f0] text-[#1a1a2e]'
                }`}
                onClick={() => handlePreferenceToggle('preferredEventTypes', type)}
              >
                {t(`searchByType.eventTypes.${type.toLowerCase()}`, type)} {/* Fallback to English type if translation not found */}
              </button>
            ))}
          </div>

          {/* Phần chọn Tags */}
          <label
            className="text-[#1a1a2e] font-montserrat font-semibold text-sm mt-6 block"
            htmlFor="tags"
          >
            {t('preferenceStep.tagsLabel')}
            <span className="text-red-600">{t('preferenceStep.requiredField')}</span>
          </label>
          {loading ? (
            <div className="text-center p-4">
              <Loader />
            </div>
          ) : apiError ? (
            <p className="text-red-500 font-montserrat text-xs mt-2">
              {t('preferenceStep.errorLoadingTags', { message: apiError })}
            </p>
          ) : tags.length === 0 ? (
            <p className="text-gray-600 font-montserrat text-sm mt-2">
              {t('preferenceStep.noTagsAvailable')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-4 max-w-xl mt-2" id="tags">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`font-montserrat rounded-full px-5 py-2 text-[11px] font-normal transition ${
                    preferredTags.includes(tag)
                      ? 'bg-[#d3d2df] text-[#1a1a2e] font-semibold'
                      : 'bg-[#e6e6f0] text-[#1a1a2e]'
                  }`}
                  onClick={() => handlePreferenceToggle('preferredTags', tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Hiển thị lỗi validation */}
          {errors.preferences && (
            <p className="text-red-500 font-montserrat text-xs mt-2">
              {errors.preferences}
            </p>
          )}

          {/* Nút submit */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full font-montserrat bg-gradient-to-r from-red-500 to-red-500 text-white p-3 rounded-lg hover:scale-105 transition-transform duration-200 mt-6"
          >
            {t('preferenceStep.completeRegistration')}
          </button>
        </div>
        <div className="flex items-center justify-center">
          <img
            alt={t('preferenceStep.imageAlt', { defaultValue: 'Illustration of people enjoying events' })}
            className="w-80 h-80 object-contain rounded-full"
            height="400"
            src="https://storage.googleapis.com/a1aa/image/c685a233-3388-4c87-bfdf-0d6600b86814.jpg"
            width="400"
          />
        </div>
      </div>
    </div>
  );
};

export default PreferenceStep;