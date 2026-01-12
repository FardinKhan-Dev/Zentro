import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";
import {
  FeaturedProducts,
  GalleryGrid,
  HeroSection,
  RecentTips,
} from "../components/home";

const Home = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#bfc0bf] dark:bg-[#0a1a0f]" />

        {/* Floating Orbs - Light Mode */}
        {/* <div className="absolute top-20 left-10 w-96 h-96 bg-[#7FC77D]/20 rounded-full blur-3xl animate-pulse" /> */}
        {/* <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#9cdb8f]/30 rounded-full blur-3xl animate-pulse delay-1000" /> */}

        {/* Floating Orbs - Dark Mode */}
        {/* <div className="absolute top-32 left-20 w-80 h-80 bg-[#1b5e20]/40 rounded-full blur-3xl animate-pulse dark:block hidden" /> */}
        {/* <div className="absolute bottom-32 right-32 w-96 h-96 bg-[#2E7D32]/30 rounded-full blur-3xl animate-pulse delay-700 dark:block hidden" /> */}
      </div>

      <div className="relative min-h-screen text-gray-900 dark:text-gray-100 overflow-x-hidden">
        {/* Hero */}
        <HeroSection />
        <div className="pointer-events-none relative h-10 w-full -mb-12 bg-linear-to-b from-black to-[#bfc0bf] dark:to-[#0a1a0f] z-10"></div>

        {/* Recent Tips Banner - Glassmorphism */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto pt-20 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl"
          >


            <div className="p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-8"
              >
                <div className='z-10 absolute top-0 right-0 w-[15%] sm:w-[50%] lg:w-[60%] xl:w-[70%] h-12 bg-[#bfc0bf] dark:bg-[#0a1a0f] rounded-bl-4xl 
                      before:absolute before:top-0 before:-left-7.5 before:w-8 before:h-8 before:bg-transparent before:rounded-tr-4xl before:shadow-[5px_-11px_0_#bfc0bf] dark:before:shadow-[5px_-11px_0_#0a1a0f]
                      after:absolute after:-bottom-5 after:right-0 after:w-5 after:h-5 after:bg-transparent after:rounded-tr-3xl after:shadow-[5px_-5px_0_#bfc0bf] dark:after:shadow-[5px_-5px_0_#0a1a0f]'>
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider bg-linear-to-r from-[#2E7D32] to-[#7FC77D] bg-clip-text text-transparent">
                  Recent Tips
                </h2>
                <MdOutlineTipsAndUpdates
                  className="text-5xl"
                  style={{ fill: "url(#tipsGradient)" }}
                />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="tipsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2E7D32" />
                      <stop offset="100%" stopColor="#7FC77D" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
                Discover our latest sustainable practices to keep your space fresh and eco-friendly.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Toss the tubs",
                    desc: "Recycle plastic pots properly — every little action helps our planet.",
                    icon: "https://cdn-icons-png.flaticon.com/512/628/628283.png",
                  },
                  {
                    title: "Reveal the plant",
                    desc: "Unveil your new green friend with care — it’s been waiting to meet you.",
                    icon: "https://cdn-icons-png.flaticon.com/512/1892/1892751.png",
                  },
                ].map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
                    className="group bg-white/60 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl p-6 flex items-center justify-between border border-gray-200/50 dark:border-gray-700/50 hover:border-[#7FC77D] dark:hover:border-[#9cdb8f] transition-all duration-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-linear-to-br from-[#7FC77D]/20 to-[#2E7D32]/20 dark:from-[#9cdb8f]/20 dark:to-[#1b5e20]/20 rounded-2xl flex items-center justify-center">
                        <img src={tip.icon} alt="" className="w-10 h-10 object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{tip.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xs">{tip.desc}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-500 rounded-full group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      <FiArrowRight className="w-5 h-5 text-black dark:text-white group-hover:text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Why Choose Us */}
        <RecentTips />

        {/* Gallery */}
        <GalleryGrid />
      </div>
    </>
  );
};

export default Home;