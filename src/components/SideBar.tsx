import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FaBox,
  FaBoxOpen,
  FaPlusCircle,
  FaTimes,
  FaList,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaGlobe,
  FaFolder,
  FaBoxes,
  FaAtlassian,
  FaVideo,
  FaGamepad,
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
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [manageAdditionalOptionsOpen, setManageAdditionalOptionsOpen] =
    useState(false);
  const [manageRequiredOptionsOpen, setManageRequiredOptionsOpen] =
    useState(false);
  const [managePromotionsOpen, setManagePromotionsOpen] = useState(false);

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
    localStorage.setItem("preferredLanguage", lng);
  };

  useEffect(() => {
    const checkScreenSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isOpen && !isDesktop) {
      // Sauvegarder la position de défilement actuelle
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restaurer le scroll quand le sidebar se ferme
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      };
    }
  }, [isOpen, isDesktop]);

  // Empêcher le scroll dans la sidebar elle-même
  useEffect(() => {
    const handleSidebarScroll = (e: Event) => {
      if (!isDesktop && isOpen) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const sidebar = document.querySelector(".sidebar-container");
    if (sidebar) {
      sidebar.addEventListener("scroll", handleSidebarScroll, {
        passive: false,
      });
      sidebar.addEventListener("touchmove", handleSidebarScroll, {
        passive: false,
      });
      sidebar.addEventListener("wheel", handleSidebarScroll, {
        passive: false,
      });
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("scroll", handleSidebarScroll);
        sidebar.removeEventListener("touchmove", handleSidebarScroll);
        sidebar.removeEventListener("wheel", handleSidebarScroll);
      }
    };
  }, [isOpen, isDesktop]);

  const sidebarVariants: Variants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    desktop: { x: 0 },
  };

  const itemVariants: Variants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: 20 },
    desktop: { opacity: 1, y: 0 },
  };

  const subItemVariants: Variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 },
    desktop: { opacity: 1, x: 0 },
  };

  const containerVariants: Variants = {
    open: { transition: { staggerChildren: 0.05 } },
    closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
    desktop: { transition: { staggerChildren: 0.05 } },
  };

  const getAnimationState = () =>
    isDesktop ? "desktop" : isOpen ? "open" : "closed";

  return (
    <>
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

      <motion.div
        initial={false}
        animate={getAnimationState()}
        variants={sidebarVariants}
        className="sidebar-container fixed lg:static top-0 left-0 h-screen w-72 text-white bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 overflow-hidden flex flex-col justify-between z-50"
        style={{
          overflowY: isOpen && !isDesktop ? "hidden" : "auto",
          touchAction: isOpen && !isDesktop ? "none" : "auto",
        }}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-orange-400">
          <motion.div
            variants={itemVariants}
            className="flex items-center space-x-2"
          >
            <FaBoxOpen className="text-2xl text-white" />
            <span className="font-bold text-xl whitespace-nowrap">
              Moe's PIZZA
            </span>
          </motion.div>
          <motion.button
            variants={itemVariants}
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-orange-400 transition-colors lg:hidden"
          >
            <FaTimes className="text-xl" />
          </motion.button>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto lg:overflow-visible">
          <motion.div variants={itemVariants}>
            <button
              onClick={() => navigate("/analytics")}
              className="flex w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <FaChartBar className="text-xl mr-3 text-white" />{" "}
              {t("sidebar.analytics")}
            </button>
          </motion.div>
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setManageProductsOpen(!manageProductsOpen)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <div className="flex items-center">
                <FaBox className="text-xl mr-3 text-white" />
                <span>{t("sidebar.manageProducts")}</span>
              </div>
              <motion.div animate={{ rotate: manageProductsOpen ? 180 : 0 }}>
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <AnimatePresence>
              {manageProductsOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-orange-300 pl-2"
                >
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/create-product")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaPlusCircle className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.addProduct")}
                    </button>
                  </motion.div>
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/products")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaList className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.productsList")}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() => setManageCategoriesOpen(!manageCategoriesOpen)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <div className="flex items-center">
                <FaFolder className="text-xl mr-3 text-white" />
                <span>{t("sidebar.manageCategories")}</span>
              </div>
              <motion.div animate={{ rotate: manageCategoriesOpen ? 180 : 0 }}>
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <AnimatePresence>
              {manageCategoriesOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-orange-300 pl-2"
                >
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/create-category")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaPlusCircle className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.addCategory")}
                    </button>
                  </motion.div>
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/categories")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaList className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.categoriesList")}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() =>
                setManageAdditionalOptionsOpen(!manageAdditionalOptionsOpen)
              }
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <div className="flex items-center">
                <FaBoxes className="text-xl mr-3 text-white" />
                <span>{t("sidebar.manageAdditionalOptions")}</span>
              </div>
              <motion.div
                animate={{ rotate: manageAdditionalOptionsOpen ? 180 : 0 }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <AnimatePresence>
              {manageAdditionalOptionsOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-orange-300 pl-2"
                >
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/additional-option-form")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaPlusCircle className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.addAdditionalOption")}
                    </button>
                  </motion.div>
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/additional-options")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaList className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.additionalOptionsList")}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() =>
                setManageRequiredOptionsOpen(!manageRequiredOptionsOpen)
              }
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <div className="flex items-center">
                <FaAtlassian className="text-xl mr-3 text-white" />
                <span>{t("sidebar.manageRequiredOptions")}</span>
              </div>
              <motion.div
                animate={{ rotate: manageRequiredOptionsOpen ? 180 : 0 }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <AnimatePresence>
              {manageRequiredOptionsOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-orange-300 pl-2"
                >
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/required-option-form")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaPlusCircle className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.addRequiredOption")}
                    </button>
                  </motion.div>
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/required-options")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaList className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.requiredOptionsList")}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* promotions */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setManagePromotionsOpen(!managePromotionsOpen)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <div className="flex items-center">
                <FaAtlassian className="text-xl mr-3 text-white" />
                <span>{t("sidebar.managePromotions")}</span>
              </div>
              <motion.div animate={{ rotate: managePromotionsOpen ? 180 : 0 }}>
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <AnimatePresence>
              {managePromotionsOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-orange-300 pl-2"
                >
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/create-promotion")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaPlusCircle className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.addPromotion")}
                    </button>
                  </motion.div>
                  <motion.div variants={subItemVariants}>
                    <button
                      onClick={() => navigate("/promotions")}
                      className="flex items-center p-2 rounded-lg hover:bg-orange-400"
                    >
                      <FaList className="text-lg mr-3 text-white" />{" "}
                      {t("sidebar.promotionsList")}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() => navigate("/reels")}
              className="flex items-center w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <FaVideo className="text-xl mr-3 text-white" />
              <span>{t("sidebar.reels")}</span>
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() => navigate("/game")}
              className="flex items-center w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <FaGamepad className="text-xl mr-3 text-white" />
              <span>{t("sidebar.game")}</span>
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-orange-400"
            >
              <div className="flex items-center">
                <FaCog className="text-xl mr-3 text-white" />
                <span>{t("sidebar.settings")}</span>
              </div>
              <motion.div animate={{ rotate: settingsOpen ? 180 : 0 }}>
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={containerVariants}
                  className="ml-6 mt-1 space-y-1 border-l-2 border-orange-300 pl-2"
                >
                  <motion.div variants={subItemVariants} className="space-y-1">
                    <div className="flex items-center p-2 rounded-lg">
                      <FaGlobe className="text-lg mr-3 text-white" />
                      <span className="whitespace-nowrap font-medium">
                        {t("sidebar.language")}
                      </span>
                    </div>
                    <div className="ml-6 space-y-1">
                      <button
                        onClick={() => changeLanguage("en")}
                        className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                          i18n.language === "en"
                            ? "bg-white bg-opacity-20 text-white"
                            : "hover:bg-orange-400"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-2 ${
                            i18n.language === "en"
                              ? "border-white bg-white"
                              : "border-white border-opacity-50"
                          }`}
                        />
                        <span>English</span>
                      </button>
                      <button
                        onClick={() => changeLanguage("de")}
                        className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                          i18n.language === "de"
                            ? "bg-white bg-opacity-20 text-white"
                            : "hover:bg-orange-400"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-2 ${
                            i18n.language === "de"
                              ? "border-white bg-white"
                              : "border-white border-opacity-50"
                          }`}
                        />
                        <span>Deutsch</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex-shrink-0 border-t border-orange-400 p-4">
          <motion.div variants={itemVariants}>
            <button
              onClick={handleLogout}
              className="flex items-center p-3 rounded-lg hover:bg-orange-400 w-full text-left"
            >
              <FaSignOutAlt className="text-xl mr-3 text-white" />{" "}
              {t("sidebar.logout")}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
