import React, { useState, useEffect } from "react";
import AttendeeForm from "./ComponentSignup/AttendeeForm";
import OrganizerForm from "./ComponentSignup/OrganizerForm";
import PreferenceStep from "./ComponentSignup/PreferenceStep";
import { useNavigate } from 'react-router-dom';
import BackIcon from "./ComponentSignup/BackIcon";
import ProgressBar from "./ComponentSignup/ProgressBar";
import Swal from 'sweetalert2';
import Footer from "../../components/Footer";
import { useTranslation } from 'react-i18next';
const RoleStep = ({ onNext, onPrev, setRole }) => {
  const { t } = useTranslation();
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    onNext();
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-[800px] mx-auto p-6">
        <ProgressBar currentStep={4} totalSteps={6} />
        <div className="bg-white rounded-[6px] shadow-2xl overflow-hidden w-[800px]">
          <div className="flex items-center justify-center px-6 py-8">
            <BackIcon onClick={onPrev} />
            <h1 className="text-4xl font-bold flex items-center justify-center mb-4">
              {t('signUp.roleStep.title')}
            </h1>
          </div>
          <div className="p-6 flex justify-center space-x-4">
            <section className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
              <article className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center p-8 max-w-[320px] mx-auto">
                <img
                  alt={t('signUp.roleStep.attendeeImageAlt')}
                  className="w-40 h-40 rounded-full"
                  height="160"
                  loading="lazy"
                  src="https://storage.googleapis.com/a1aa/image/40388b28-ddb8-4b15-d644-2791fd8b4a57.jpg"
                  width="160"
                />
                <h2 className="mt-6 font-semibold text-xl text-[#1B0B3B]">
                  {t('signUp.roleStep.attendeeTitle')}
                </h2>
                <button
                  className="mt-6 px-6 py-2 border border-gray-400 rounded-md text-[#1B0B3B] text-sm font-normal hover:bg-gray-50 transition"
                  type="button"
                  onClick={() => handleRoleSelect("attendee")}
                >
                  {t('signUp.roleStep.attendeeButton')}
                </button>
              </article>
              <article className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center p-8 max-w-[320px] mx-auto">
                <img
                  alt={t('signUp.roleStep.organizerImageAlt')}
                  className="w-40 h-40 rounded-full"
                  height="160"
                  loading="lazy"
                  src="https://storage.googleapis.com/a1aa/image/215f5b3b-6dbd-4d88-670b-c144d5cf1f7e.jpg"
                  width="160"
                />
                <h2 className="mt-6 font-semibold text-xl text-[#1B0B3B]">
                  {t('signUp.roleStep.organizerTitle')}
                </h2>
                <button
                  className="mt-6 px-6 py-2 border border-gray-400 rounded-md text-[#1B0B3B] text-sm font-normal hover:bg-gray-50 transition"
                  type="button"
                  onClick={() => handleRoleSelect("organizer")}
                >
                  {t('signUp.roleStep.organizerButton')}
                </button>
              </article>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const NameStep = ({ onNext, onPrev, setUserData, email }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validatePassword = (value) => {
    if (!value) return t('signUp.nameStep.passwordRequiredError');
    if (value.length < 8) return t('signUp.nameStep.passwordLengthError');
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const passwordError = validatePassword(password);

    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    setErrors({});
    setUserData({ password });
    onNext();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md mx-auto p-6">
        <ProgressBar currentStep={3} totalSteps={6} />
        <div className="bg-white rounded-[6px] shadow-2xl overflow-hidden w-[450px] h-[500px]">
          <h1 className="text-xl font-bold text-orange-500 mt-2 px-6 py-2 hover:cursor-pointer">
            {t('signUp.brandName')}
          </h1>
          <div className="px-6 pt-6 pb-8">
            <h2 className="text-3xl font-bold flex items-center">
              <BackIcon onClick={onPrev} />
              {t('signUp.nameStep.title')}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="px-10 py-6 space-y-6">
            <div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-900"
                aria-label="Email"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('signUp.nameStep.passwordPlaceholder')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors.password ? "border-red-500" : ""
                  }`}
                required
                aria-label="Password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-500 text-white p-3 rounded-lg hover:scale-105 transition-transform duration-200"
            >
             {t('signUp.nameStep.submitButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const VerificationStep = ({ email, verificationCode, onNext, onPrev }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: t('signUp.verificationStep.warningTitle'),
        text: t('signUp.verificationStep.invalidCodeWarning'),
      });
      return;
    }

    if (code === verificationCode) {
      onNext();
    } else {
      Swal.fire({
        icon: 'error',
        title: t('signUp.verificationStep.errorTitle'),
        text: t('signUp.verificationStep.invalidCodeError'),
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md mx-auto p-6">
        <ProgressBar currentStep={2} totalSteps={6} />
        <div className="bg-white rounded-[6px] shadow-2xl overflow-hidden w-[450px]">
          <h1 className="text-xl font-bold text-orange-500 mt-2 px-6 py-2 hover:cursor-pointer">
            {t('signUp.brandName')}
          </h1>
          <div className="px-6 pt-6 pb-4">
            <BackIcon onClick={onPrev} />
            <h2 className="text-3xl font-bold flex items-center mb-4">
              {t('signUp.verificationStep.title')}
            </h2>
            <span className="text-[13px] text-gray-500">
              {t('signUp.verificationStep.description')}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <input
              type="email"
              value={email}
              disabled
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-900"
              aria-label="Email"
            />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('signUp.verificationStep.codePlaceholder')}
              maxLength="6"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
              aria-label="Verification Code"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-400 to-orange-400 text-white p-3 rounded-lg hover:scale-105 transition-transform duration-200"
            >
              {t('signUp.verificationStep.submitButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const EmailStep = ({ onNext, setEmail }) => {
  const { t } = useTranslation();
  const [inputEmail, setInputEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/auth/send-verification-code/${inputEmail}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.code || 'Unable to send verification code');
      }

      const data = await response.text();
      setEmail(inputEmail);

      Swal.fire({
        icon: 'success',
        title: t('signUp.verificationStep.successTitle'),
        text: t('signUp.verificationStep.verificationSuccess', { email: inputEmail }),
      });
      onNext(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('signUp.verificationStep.errorTitle'),
        text: t('signUp.verificationStep.verificationError'),
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md mx-auto p-6">
        <ProgressBar currentStep={1} totalSteps={6} />
        <div className="bg-white rounded-[6px] shadow-2xl overflow-hidden h-[400px] w-[450px]">
          <h1 className="text-xl font-bold text-orange-500 mt-2 px-6 py-2 hover:cursor-pointer">
            {t('signUp.brandName')}
          </h1>
          <div className="to-red-400 p-6 mb-4">
            <h2 className="text-3xl font-bold">{t('signUp.emailStep.titleWelcome')}</h2>
            <h2 className="text-3xl font-bold">{t('signUp.emailStep.titleEmail')}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-10">
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder={t('signUp.emailPlaceholder')}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
              aria-label={t('signUp.emailStep.submittingButton')}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white p-3 rounded-[6px] hover:scale-105 transition-transform duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                t('signUp.emailStep.submitButton')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children }) => {
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error("ErrorBoundary caught:", error);
      setHasError(true);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="text-center text-red-500 p-8">
        <h2>{t('signUp.errorBoundary.title')}</h2>
        <p>{t('signUp.errorBoundary.message')}</p>
      </div>
    );
  }

  return children;
};

const EventSignUp = () => {

  const [currentStep, setCurrentStep] = useState(1);
  const [nextStepToShow, setNextStepToShow] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState({});
  const [role, setRole] = useState("");
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep === 7) {
      navigate('/login');
    }
  }, [currentStep, navigate]);

  useEffect(() => {
    if (isExiting && nextStepToShow !== null) {
      const timer = setTimeout(() => {
        setIsExiting(false);
        setCurrentStep(nextStepToShow);
        setTransitionKey((prev) => prev + 1);
        setNextStepToShow(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isExiting, nextStepToShow]);

  const nextStep = (data) => {
    setDirection("forward");
    setIsExiting(true);
    setNextStepToShow(currentStep + 1);
    if (data) {
      if (typeof data === 'string') {
        setVerificationCode(data);
      } else {
        setUserData((prev) => ({ ...prev, ...data }));
      }
    }
  };

  const prevStep = () => {
    setDirection("backward");
    setIsExiting(true);
    setNextStepToShow(currentStep - 1);
  };

  const renderStep = () => {

    const animationClass = isExiting
      ? direction === "forward"
        ? "animate-slide-out-left"
        : "animate-slide-out-right"
      : direction === "forward"
        ? "animate-slide-in-right"
        : "animate-slide-in-left";
    return (
      <>
        <div
          key={transitionKey}
          className={`will-change-transform-opacity ${animationClass}`}
          aria-live="polite"
        >
          {(() => {
            const stepToRender = nextStepToShow || currentStep;
            switch (stepToRender) {
              case 1:
                return <EmailStep onNext={nextStep} setEmail={setEmail} />;
              case 2:
                return (
                  <VerificationStep
                    email={email}
                    verificationCode={verificationCode}
                    onNext={nextStep}
                    onPrev={prevStep}
                  />
                );
              case 3:
                return (
                  <NameStep
                    onNext={nextStep}
                    onPrev={prevStep}
                    setUserData={setUserData}
                    email={email}
                  />
                );
              case 4:
                return (
                  <RoleStep
                    onNext={nextStep}
                    onPrev={prevStep}
                    setRole={setRole}
                  />
                );
              case 5:
                return role === "attendee" ? (
                  <AttendeeForm
                    email={email}
                    userData={userData}
                    onComplete={nextStep}
                    onPrev={prevStep}
                  />
                ) : (
                  <OrganizerForm
                    email={email}
                    userData={userData}
                    onComplete={nextStep}
                    onPrev={prevStep}
                  />
                );
              case 6:
                return role === "attendee" ? (
                  <PreferenceStep
                    email={email}
                    userData={userData}
                    onComplete={nextStep}
                    onPrev={prevStep}
                  />
                ) : (
                  null // Organizer không cần bước này, chuyển thẳng đến đăng nhập
                );
              default:
                return null;
            }
          })()}
        </div>

      </>
    );
  };
  return <ErrorBoundary>{renderStep()}</ErrorBoundary>;
};
export default EventSignUp;