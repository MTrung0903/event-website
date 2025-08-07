import { useTranslation } from 'react-i18next';

const ProgressBar = ({ currentStep, totalSteps = 6 }) => {
  const { t } = useTranslation(); // Hook to access translations
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-[450px] max-w-[500px] mx-auto mb-4">
      <div className="bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-orange-500 to-red-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">
        {t('progressBar.stepLabel', { currentStep, totalSteps })}
      </p>
    </div>
  );
};

export default ProgressBar;