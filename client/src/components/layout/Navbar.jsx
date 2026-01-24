import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, openAuthDrawer } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/authApi";
import CartIcon from "../../components/cart/CartIcon";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation
} from "../../features/notifications/notificationApi";
import { notificationApi } from "../../features/notifications/notificationApi";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import {
  FiUser,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { IoClose } from "@react-icons/all-files/io5/IoClose";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false);
  const [mobileNotificationOpen, setMobileNotificationOpen] = useState(false);


  // ROI: Refs for Click Outside
  const notificationRef = useRef();
  const mobileNotificationRef = useRef();
  const userMenuRef = useRef();
  const megaMenuRef = useRef();
  const searchRef = useRef();

  useOnClickOutside(notificationRef, () => setNotificationOpen(false));
  useOnClickOutside(mobileNotificationRef, () => setMobileNotificationOpen(false));
  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useOnClickOutside(megaMenuRef, () => setMegaMenuOpen(false));
  useOnClickOutside(searchRef, () => setSearchOpen(false));

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { user, isAuthenticated } = useAuth();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { darkMode, toggleTheme } = useTheme();

  // ================================
  // 🧠 AI SEARCH (Gemini via backend proxy)
  // ================================
  useEffect(() => {
    if (!searchQuery.trim()) return setSuggestions([]);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data?.suggestions || []);
      } catch (err) {
        console.error("AI Search Error:", err);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // ================================
  // 🔔 Notification Data (Real)
  // ================================
  const { data: notifData } = useGetNotificationsQuery(1, { skip: !isAuthenticated });
  const { data: unreadData } = useGetUnreadCountQuery(undefined, { skip: !isAuthenticated });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notifData?.data?.notifications || [];
  const unreadCount = unreadData?.data?.count || 0;

  const { socket, isConnected } = useSocket();

  // Prevent duplicate toasts (both Navbar and Dashboard can listen)
  const lastNotificationIdRef = useRef(null);

  // Listen for Real-Time Notifications
  useEffect(() => {
    if (socket && isConnected && user?._id) {
      // Join user room
      socket.emit('join:user', user._id);

      const handleNewNotification = (notification) => {
        // Prevent duplicate toast if same notification already shown
        if (lastNotificationIdRef.current === notification._id) {
          console.log('⏭️ Skipping duplicate notification toast');
          return;
        }
        lastNotificationIdRef.current = notification._id;

        // Invalidate cache to refresh list
        dispatch(notificationApi.util.invalidateTags(['Notifications', 'UnreadCount']));

        // Show Toast
        toast(notification.title, {
          icon: '🔔',
          duration: 4000,
          position: 'top-right'
        });
      };

      socket.on('notification:new', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
      }
    }
  }, [socket, isConnected, user, dispatch]);

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
    }
    // Navigate if relatedId exists (e.g. to order)
    if (n.type === 'order' && n.relatedId) {
      navigate(`/orders/${n.relatedId}`);
      setNotificationOpen(false);
    }
  };

  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Call server logout endpoint to clear cookies
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if server call fails
    } finally {
      // Clear Redux state
      dispatch(logout());
      navigate("/");
      setUserMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Stores", path: "/stores" },
    { name: "About Us", path: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl shadow-md border-b border-white/20 dark:border-white/10 px-6 py-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-linear-to-br from-[#7FC77D] to-[#2E7D32] rounded-xl flex items-center justify-center text-white text-xl font-bold">
            Z
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white hidden sm:block">Zentro</span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center space-x-4 lg:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="relative text-gray-900 dark:text-gray-200 hover:text-[#2E7D32] font-medium group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#7FC77D] group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          {/* MEGA MENU */}
          <div
            ref={megaMenuRef}
            className="relative"
          >
            <button onClick={() => setMegaMenuOpen(!megaMenuOpen)} className="text-gray-900 dark:text-gray-200 font-medium hover:text-green-700">
              Explore ▾
            </button>

            {megaMenuOpen && (
              <div
                className="
                  absolute top-10 left-0 w-64 
                  bg-white dark:bg-gray-900 
                  shadow-xl rounded-lg p-4 
                  border border-gray-200 dark:border-gray-700 
                  animate-slide-down
                "
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Featured Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/products?sort=newest" className="block hover:text-green-600 dark:hover:text-green-400">
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?sort=popular" className="block hover:text-green-600 dark:hover:text-green-400">
                      Best Sellers
                    </Link>
                  </li>
                  <li>
                    <Link to="/products?sort=price_asc" className="block hover:text-green-600 dark:hover:text-green-400">
                      Special Offers
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE (DESKTOP) */}
        <div className="flex items-center space-x-4">

          {/* SEARCH FIELD */}
          <div ref={searchRef} className="relative hidden lg:flex items-center">
            {searchOpen && (
              <div className="relative">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="
                    border border-gray-400 dark:border-gray-600
                    bg-white/60 dark:bg-gray-800/60
                    px-3 py-1 rounded-full 
                    w-40 lg:w-52 focus:w-60 lg:focus:w-72
                    transition-all duration-300
                    outline-none text-gray-900 dark:text-gray-200
                  "
                />

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute mt-2 w-full bg-white dark:bg-gray-900 shadow-xl rounded-lg p-2 text-sm">
                    {suggestions.map((s, index) => (
                      <div key={index} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <FiSearch
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-5 h-5 cursor-pointer ml-2 text-gray-900 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition"
            />
          </div>

          {/* NOTIFICATIONS */}
          <div ref={notificationRef} className="relative hidden lg:block">
            <FiBell
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="w-5 h-5 cursor-pointer text-gray-900 dark:text-gray-200 hover:text-green-600"
            />

            {/* Notification badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            {notificationOpen && (
              <div className="
                absolute right-0 mt-3 w-72 
                bg-white dark:bg-gray-900 
                border border-gray-200 dark:border-gray-700 
                shadow-xl rounded-lg p-3
                animate-slide-down
              ">
                <div className="flex justify-between items-center mb-2 px-1">
                  <div className="font-semibold">Notifications</div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-green-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={`flex items-start space-x-2 mb-2 p-2 rounded cursor-pointer transition-colors ${n.isRead
                          ? 'hover:bg-gray-100 dark:hover:bg-gray-800 opacity-70'
                          : 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500'
                          }`}
                      >
                        <div className="mt-1">
                          {n.type === 'order' && <span className="text-blue-500">📦</span>}
                          {n.type === 'info' && <span className="text-gray-500">ℹ️</span>}
                          {n.type === 'promo' && <span className="text-yellow-500">🏷️</span>}
                          {n.type === 'alert' && <span className="text-red-500">⚠️</span>}
                        </div>

                        <div className="text-sm flex-1">
                          <div className={`font-medium ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {n.title}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
                            {n.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {!n.isRead && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CART */}
          <div className="relative">
            <CartIcon />
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-900 dark:text-gray-200" />
            )}
          </button>

          {/* USER MENU */}
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Open User Menu"
                className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-[#7FC77D] rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0]}
                </div>
              </button>

              {userMenuOpen && (
                <div onClick={() => setUserMenuOpen(!userMenuOpen)} className="
                  absolute right-0 mt-2 w-52
                  bg-white dark:bg-gray-900 
                  shadow-lg rounded-lg border 
                  p-2 animate-slide-down
                ">
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  {user.role !== 'admin' && (
                    <>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">My Profile</Link>
                    </>
                  )}

                  {user.role === "admin" && (
                    <Link className="block px-4 py-2 text-green-700 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => dispatch(openAuthDrawer('login'))}
              aria-label="Login"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiUser className="w-6 h-6 text-gray-900 dark:text-gray-200" />
            </button>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
            className="lg:hidden p-2 hover:bg-gray-700 dark:hover:bg-gray-200 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* =============================
          MOBILE DRAWER
      ============================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 h-screen dark:bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 w-72 md:w-[450px] h-full bg-white dark:bg-gray-900 shadow-xl p-6 animate-slide-right">

            {/* Close Button */}
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4">
              <IoClose className="w-7 h-7 text-gray-700 dark:text-gray-300" />
            </button>

            {/* MOBILE SEARCH & NOTIFICATIONS */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex-1 flex items-center border rounded-full px-3 py-2 bg-gray-50 dark:bg-black/20">
                <FiSearch className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="ml-2 w-full bg-transparent outline-none dark:text-white"
                />
              </div>

              {/* Mobile Notification Icon */}
              <div ref={mobileNotificationRef} className="relative">
                <button
                  onClick={() => setMobileNotificationOpen(!mobileNotificationOpen)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <FiBell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {mobileNotificationOpen && (
                  <div className="
                    absolute right-0 mt-2 w-72 
                    bg-white dark:bg-gray-900 
                    border border-gray-200 dark:border-gray-700 
                    shadow-xl rounded-lg p-3 z-50
                    animate-slide-down
                  ">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <div className="font-semibold text-gray-900 dark:text-white">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-green-600 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              handleNotificationClick(n);
                              setMobileNotificationOpen(false);
                            }}
                            className={`flex items-start space-x-2 mb-2 p-2 rounded cursor-pointer transition-colors ${n.isRead
                              ? 'hover:bg-gray-100 dark:hover:bg-gray-800 opacity-70'
                              : 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500'
                              }`}
                          >
                            <div className="mt-1">
                              {n.type === 'order' && <span className="text-blue-500">📦</span>}
                              {n.type === 'info' && <span className="text-gray-500">ℹ️</span>}
                              {n.type === 'promo' && <span className="text-yellow-500">🏷️</span>}
                              {n.type === 'alert' && <span className="text-red-500">⚠️</span>}
                            </div>
                            <div className="text-sm flex-1">
                              <div className={`font-medium ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                {n.title}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-1">
                                {n.message}
                              </div>
                            </div>
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE NAV LINKS */}
            <div className="mt-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-medium text-gray-900 dark:text-gray-200 hover:text-green-700"
                >
                  {link.name}
                </Link>
              ))}

              {/* Collapsible Explore Menu */}
              <div>
                <button
                  onClick={() => setMobileMegaMenuOpen(!mobileMegaMenuOpen)}
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-900 dark:text-gray-200 hover:text-green-700"
                >
                  Explore
                  <span className={`transform transition-transform ${mobileMegaMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {mobileMegaMenuOpen && (
                  <div className="mt-2 pl-4 space-y-3 border-l-2 border-gray-100 dark:border-zinc-800 ml-1">
                    <Link
                      to="/products?sort=newest"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-base text-gray-600 dark:text-gray-400 hover:text-green-600"
                    >
                      New Arrivals
                    </Link>
                    <Link
                      to="/products?sort=popular"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-base text-gray-600 dark:text-gray-400 hover:text-green-600"
                    >
                      Best Sellers
                    </Link>
                    <Link
                      to="/products?sort=price_asc"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-base text-gray-600 dark:text-gray-400 hover:text-green-600"
                    >
                      Special Offers
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
