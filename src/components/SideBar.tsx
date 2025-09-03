import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FaBox,
  FaBoxOpen,
  FaPlusCircle,
  FaTimes,
  FaList,
  FaHome,
  FaChartBar,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaGlobe,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logOut } from "../services/authService";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [manageProductsOpen, setManageProductsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Sauvegarder la préférence de langue
    localStorage.setItem("preferredLanguage", lng);
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Bloquer le défilement quand la sidebar est ouverte sur mobile
  useEffect(() => {
    if (isOpen && !isDesktop) {
      // Sauvegarder la position de défilement actuelle
      const scrollY = window.scrollY;

      // Appliquer les styles pour bloquer le défilement
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restaurer le défilement lorsque la sidebar est fermée
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, isDesktop]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleManageProducts = () => {
    setManageProductsOpen(!manageProductsOpen);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Animation variants
  const sidebarVariants: Variants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    desktop: {
      x: 0,
    },
  };

  const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    closed: {
      opacity: 0,
      y: 20,
      transition: {
        delay: 0.1,
      },
    },
    desktop: {
      opacity: 1,
      y: 0,
    },
  };

  const subItemVariants: Variants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        delay: 0.05,
      },
    },
    desktop: {
      opacity: 1,
      x: 0,
    },
  };

  const containerVariants: Variants = {
    open: {
      transition: {
        staggerChildren: 0.05,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
    desktop: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const getAnimationState = () => {
    if (isDesktop) {
      return "desktop";
    }
    return isOpen ? "open" : "closed";
  };

  return (
    <>
      {/* Overlay pour mobile seulement */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={getAnimationState()}
        variants={sidebarVariants}
        className="fixed lg:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-indigo-800 to-purple-900 text-white shadow-xl z-50 overflow-hidden flex flex-col"
      >
        {/* Header avec bouton toggle */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-purple-700">
          <motion.div
            variants={itemVariants}
            className="flex items-center space-x-2"
          >
            <FaBoxOpen className="text-2xl text-yellow-400" />
            <span className="font-bold text-xl whitespace-nowrap">
              ProductHub
            </span>
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-purple-700 transition-colors lg:hidden"
          >
            <FaTimes className="text-xl" />
          </motion.button>
        </div>

        {/* Menu items avec défilement automatique */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Accueil */}
          <motion.div variants={itemVariants}>
            <a
              href="#"
              className="flex items-center p-3 rounded-lg hover:bg-purple-700 transition-colors group"
            >
              <FaHome className="text-xl mr-3 text-purple-300 group-hover:text-white" />
              <span className="whitespace-nowrap">
                {t("sidebar.dashboard")}
              </span>
            </a>
          </motion.div>

          {/* Manage Products */}
          <motion.div variants={itemVariants}>
            <button
              onClick={toggleManageProducts}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-purple-700 transition-colors group"
            >
              <div className="flex items-center">
                <FaBox className="text-xl mr-3 text-blue-300 group-hover:text-white" />
                <span className="whitespace-nowrap">
                  {t("sidebar.manageProducts")}
                </span>
              </div>
              <motion.div
                animate={{ rotate: manageProductsOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </button>

            {/* Sous-éléments */}
            <AnimatePresence>
              {manageProductsOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-purple-600 pl-2"
                >
                  <motion.div variants={subItemVariants}>
                    <a
                      href="#"
                      className="flex items-center p-2 rounded-lg hover:bg-purple-700 transition-colors group"
                    >
                      <FaPlusCircle className="text-lg mr-3 text-green-300 group-hover:text-white" />
                      <span className="whitespace-nowrap">
                        {t("sidebar.addProduct")}
                      </span>
                    </a>
                  </motion.div>

                  <motion.div variants={subItemVariants}>
                    <a
                      href="#"
                      className="flex items-center p-2 rounded-lg hover:bg-purple-700 transition-colors group"
                    >
                      <FaList className="text-lg mr-3 text-yellow-300 group-hover:text-white" />
                      <span className="whitespace-nowrap">
                        {t("sidebar.productsList")}
                      </span>
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Analytics */}
          <motion.div variants={itemVariants}>
            <a
              href="#"
              className="flex items-center p-3 rounded-lg hover:bg-purple-700 transition-colors group"
            >
              <FaChartBar className="text-xl mr-3 text-teal-300 group-hover:text-white" />
              <span className="whitespace-nowrap">
                {t("sidebar.analytics")}
              </span>
            </a>
          </motion.div>

          {/* Settings avec sous-menu Langue */}
          <motion.div variants={itemVariants}>
            <button
              onClick={toggleSettings}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-purple-700 transition-colors group"
            >
              <div className="flex items-center">
                <FaCog className="text-xl mr-3 text-gray-300 group-hover:text-white" />
                <span className="whitespace-nowrap">
                  {t("sidebar.settings")}
                </span>
              </div>
              <motion.div
                animate={{ rotate: settingsOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </button>

            {/* Sous-éléments Settings */}
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-purple-600 pl-2"
                >
                  {/* Language Selector */}
                  <motion.div variants={subItemVariants} className="space-y-1">
                    <div className="flex items-center p-2 rounded-lg group">
                      <FaGlobe className="text-lg mr-3 text-blue-300" />
                      <span className="whitespace-nowrap font-medium">
                        {t("sidebar.language")}
                      </span>
                    </div>

                    {/* Options de langue */}
                    <div className="ml-6 space-y-1">
                      <button
                        onClick={() => changeLanguage("en")}
                        className={`flex items-center w-full p-2 rounded-lg transition-colors group ${
                          i18n.language === "en"
                            ? "bg-purple-600 text-white"
                            : "hover:bg-purple-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                            i18n.language === "en"
                              ? "border-white bg-white"
                              : "border-purple-300 group-hover:border-white"
                          }`}
                        >
                          {i18n.language === "en" && (
                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                          )}
                        </div>
                        <span>English</span>
                      </button>

                      <button
                        onClick={() => changeLanguage("de")}
                        className={`flex items-center w-full p-2 rounded-lg transition-colors group ${
                          i18n.language === "de"
                            ? "bg-purple-600 text-white"
                            : "hover:bg-purple-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                            i18n.language === "de"
                              ? "border-white bg-white"
                              : "border-purple-300 group-hover:border-white"
                          }`}
                        >
                          {i18n.language === "de" && (
                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                          )}
                        </div>
                        <span>Deutsch</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Profile */}
          <motion.div variants={itemVariants}>
            <a
              href="#"
              className="flex items-center p-3 rounded-lg hover:bg-purple-700 transition-colors group"
            >
              <FaUser className="text-xl mr-3 text-pink-300 group-hover:text-white" />
              <span className="whitespace-nowrap">{t("sidebar.profile")}</span>
            </a>
          </motion.div>
        </div>

        {/* Logout - toujours en bas */}
        <div className="flex-shrink-0 border-t border-purple-700 p-4">
          <motion.div variants={itemVariants}>
            <button
              onClick={handleLogout}
              className="flex items-center p-3 rounded-lg hover:bg-purple-700 transition-colors group w-full text-left"
            >
              <FaSignOutAlt className="text-xl mr-3 text-red-300 group-hover:text-white" />
              <span className="whitespace-nowrap">{t("sidebar.logout")}</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
