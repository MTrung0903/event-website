import { Routes, Route } from 'react-router-dom';
import LoginForm from '../pages/Auth/LogIn';
import EventSignup from '../pages/Auth/SignUp';
import ForgotPassword from '../pages/Auth/ForgotPass';
import ResetPassword from '../pages/Auth/ResetPassword';
import { ROUTES } from '../constants/routes';

const AuthLayout = () => (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<LoginForm />} />
    <Route path={ROUTES.SIGNUP} element={<EventSignup />} />
    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
    <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
  </Routes>
);

export default AuthLayout;