import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from './LoginForm';

const Login = () => {
    return (
        <div className="h-full flex items-center justify-center relative overflow-hidden pt-8 pb-20 px-4">
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[#bfc0bf] dark:bg-[#0a1a0f]" />
                <div className="absolute top-20 left-10 w-96 h-96 bg-[#7FC77D]/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-32 left-20 w-80 h-80 bg-[#1b5e20]/40 rounded-full blur-3xl animate-pulse dark:block hidden" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 flex flex-col md:flex-row"
            >
                {/* Left Side - Image */}
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&auto=format&fit=crop&q=60"
                        alt="Login Visual"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="w-full absolute bottom-0 z-10 
                    bg-[#ececec]/30 dark:bg-[#181e1a]/50 backdrop-blur-lg 
                     p-6 rounded-t-lg">
                        <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-200">Welcome Back!</h3>
                        <p className="text-gray-600 dark:text-gray-400">We're so excited to see you again.</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <LoginForm />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
