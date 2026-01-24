import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLoginMutation, useVerifyOTPMutation } from '../../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { closeAuthDrawer, switchAuthView } from '../../features/auth/authSlice';
import { FiMail } from '@react-icons/all-files/fi/FiMail';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import { FiAlertCircle } from '@react-icons/all-files/fi/FiAlertCircle';
import { FiEye } from '@react-icons/all-files/fi/FiEye';
import { FiEyeOff } from '@react-icons/all-files/fi/FiEyeOff';
import { FcGoogle } from '@react-icons/all-files/fc/FcGoogle';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema } from '../../validations/authValidation';
import { cartApi } from '../../features/cart/cartApi';




const LoginForm = ({ isDrawer = false }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [show2FA, setShow2FA] = React.useState(false);
    const [otp, setOtp] = React.useState('');
    const [emailFor2FA, setEmailFor2FA] = React.useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
    const [verifyOTP, { isLoading: isVerifying, error: verifyError }] = useVerifyOTPMutation();

    const from = location.state?.from?.pathname || '/';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (data) => {
        try {
            const response = await login(data).unwrap();

            // Check for 2FA requirement
            if (response.data?.require2fa) {
                setShow2FA(true);
                setEmailFor2FA(response.data.email);
                return;
            }

            // Refetch cart to sync guest cart items with logged-in user cart
            dispatch(cartApi.util.invalidateTags(['Cart']));

            if (isDrawer) {
                dispatch(closeAuthDrawer());
                if (response.data.role === 'admin') {
                    navigate('/admin');
                }
            } else {
                if (response.data.role === 'admin') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate(from, { replace: true });
                }
            }
        } catch (err) {
            // Error handled by apiError state
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await verifyOTP({ email: emailFor2FA, otp }).unwrap();

            // Refetch cart to sync guest cart items with logged-in user cart
            dispatch(cartApi.util.invalidateTags(['Cart']));

            if (isDrawer) {
                dispatch(closeAuthDrawer());
                if (response.data.role === 'admin') {
                    navigate('/admin');
                }
            } else {
                if (response.data.role === 'admin') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate(from, { replace: true });
                }
            }
        } catch (err) {
            console.error('OTP Verification Failed:', err);
        }
    };

    const handleGoogleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.open(`${apiUrl}/api/auth/google`, "_self");
    };

    // 2FA UI
    if (show2FA) {
        return (
            <div className="w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black tracking-wider bg-linear-to-r from-[#2E7D32] to-[#7FC77D] bg-clip-text text-transparent mb-2">
                        Verify Login
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter the code sent to your email
                    </p>
                </div>

                {verifyError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm"
                    >
                        <FiAlertCircle className="w-4 h-4 shrink-0" />
                        {verifyError?.data?.message || 'Verification failed'}
                    </motion.div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Verification Code</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="block w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7FC77D] border-gray-300 dark:border-gray-600"
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-3 text-lg dark:text-white"
                        loading={isVerifying}
                    >
                        Verify Code
                    </Button>

                    <button
                        type="button"
                        onClick={() => setShow2FA(false)}
                        className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full" >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-wider bg-linear-to-r from-[#2E7D32] to-[#7FC77D] bg-clip-text text-transparent mb-2">
                    Sign In
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Access your account to manage orders
                </p>
            </div>

            {loginError && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm"
                >
                    <FiAlertCircle className="w-4 h-4 shrink-0" />
                    {loginError?.data?.message || 'Login failed'}
                </motion.div>
            )
            }

            < form onSubmit={handleSubmit(onSubmit)} className="space-y-5" >
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            {...register('email')}
                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7FC77D] focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            placeholder="you@example.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <Link
                            to="/request-reset"
                            onClick={() => isDrawer && dispatch(closeAuthDrawer())}
                            className="text-sm font-medium text-[#2E7D32] hover:text-[#7FC77D] transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register('password')}
                            className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7FC77D] focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                        >
                            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>
                    )}
                </div>

                <div className="flex items-center ml-1">
                    <input
                        id="remember-me"
                        type="checkbox"
                        {...register('rememberMe')}
                        className="h-4 w-4 text-[#2E7D32] focus:ring-[#7FC77D] border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        Remember me
                    </label>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-lg dark:text-white"
                    loading={isLoginLoading}
                >
                    Sign In
                </Button>
            </form >

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-500 bg-[#ececec] dark:bg-[#181e1a]">
                            Or continue with
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-200 font-medium shadow-sm hover:shadow-md"
                >
                    <FcGoogle className="w-5 h-5" />
                    Sign in with Google
                </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                {isDrawer ? (
                    <button
                        onClick={() => dispatch(switchAuthView('register'))}
                        className="font-bold text-[#2E7D32] hover:text-[#7FC77D] transition-colors"
                    >
                        Sign up now
                    </button>
                ) : (
                    <Link
                        to="/register"
                        className="font-bold text-[#2E7D32] hover:text-[#7FC77D] transition-colors"
                    >
                        Sign up now
                    </Link>
                )}
            </p>
        </div >
    );
};

export default LoginForm;
