import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { closeAuthDrawer, switchAuthView } from '../../features/auth/authSlice';
import { FiMail } from '@react-icons/all-files/fi/FiMail';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import { FiAlertCircle } from '@react-icons/all-files/fi/FiAlertCircle';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiEye } from '@react-icons/all-files/fi/FiEye';
import { FiEyeOff } from '@react-icons/all-files/fi/FiEyeOff';
import { FiPhone } from '@react-icons/all-files/fi/FiPhone';
import { FcGoogle } from '@react-icons/all-files/fc/FcGoogle';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerFormSchema } from '../../validations/authValidation';




const RegisterForm = ({ isDrawer = false }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [registerUser, { isLoading, error: apiError }] = useRegisterMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            const userData = await registerUser(data).unwrap();
            console.log(userData);

            if (isDrawer) {
                dispatch(closeAuthDrawer());
                navigate('/admin'); // Or wherever you want to redirect after signup
            } else {
                navigate('/admin', { replace: true });
            }
        } catch (err) {
            // Error handled by apiError state
        }
    };

    const handleGoogleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.open(`${apiUrl}/api/auth/google`, "_self");
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-wider bg-linear-to-r from-[#2E7D32] to-[#7FC77D] bg-clip-text text-transparent mb-2">
                    Create Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Join us and start shopping today
                </p>
            </div>

            {apiError && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm"
                >
                    <FiAlertCircle className="w-4 h-4 shrink-0" />
                    {apiError?.data?.message || 'Registration failed'}
                </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('name')}
                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7FC77D] focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            placeholder="John Doe"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-red-500 text-xs ml-1">{errors.name.message}</p>
                    )}
                </div>

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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            {...register('phoneNumber')}
                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7FC77D] focus:border-transparent transition-all ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            placeholder="+1234567890"
                        />
                    </div>
                    {errors.phoneNumber && (
                        <p className="text-red-500 text-xs ml-1">{errors.phoneNumber.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
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

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            {...register('confirmPassword')}
                            className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7FC77D] focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                        >
                            {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs ml-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-lg dark:text-white"
                    loading={isLoading}
                >
                    Create Account
                </Button>
            </form>

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
                    Sign up with Google
                </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                {isDrawer ? (
                    <button
                        onClick={() => dispatch(switchAuthView('login'))}
                        className="font-bold text-[#2E7D32] hover:text-[#7FC77D] transition-colors"
                    >
                        Sign in
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="font-bold text-[#2E7D32] hover:text-[#7FC77D] transition-colors"
                    >
                        Sign in
                    </Link>
                )}
            </p>
        </div>
    );
};

export default RegisterForm;
