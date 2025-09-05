import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaLock,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaHamburger, // Icône de fast-food
} from "react-icons/fa";
import { authenticateUser, whoAmI } from "../services/authService";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../app/i18n/i18n";

export default function Home() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<"DE" | "ENG">("DE");
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      if (videoRef.current) {
        videoRef.current.style.width = "100%";
        videoRef.current.style.height = "100%";
        videoRef.current.style.objectFit = "cover";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Changer la langue lorsque la sélection change
    const langCode = language === "DE" ? "de" : "en";
    changeLanguage(langCode);
  }, [language]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { access_token } = await authenticateUser(email, password);

      if (access_token) {
        const user = await whoAmI();

        if (user.role === "ADMIN") {
          navigate("/products");
        } else {
          setError(
            t(
              "login.accessDenied",
              "Access denied. Administrator privileges required."
            )
          );
        }
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        setError(
          error.message ||
            t(
              "login.invalidCredentials",
              "Email or password incorrect, please try again"
            )
        );
      } else {
        setError(
          t(
            "login.invalidCredentials",
            "Email or password incorrect, please try again"
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-screen h-screen overflow-auto lg:overflow-hidden">
      <div className="w-full lg:w-1/2 h-1/3 lg:h-full relative overflow-hidden order-1 lg:order-1">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/assets/images/restaurant_dashboard_home_page.mp4"
          autoPlay
          muted
          loop
          onError={(e) => console.error("Video error:", e)}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "cover";
          }}
        />

        <div className="absolute top-0 left-0 w-full h-full  z-10"></div>

        <div className="absolute top-6 right-6 z-50">
          <div className="flex justify-center items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="text-yellow-400"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0.7, 1, 0],
                  scale: [0.5, 1.1, 0.9, 1, 0.6],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  times: [0, 0.2, 0.5, 0.8, 1],
                }}
              >
                <FaStar size={14} />
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-2/3 lg:h-full flex items-center justify-center bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 overflow-y-auto lg:overflow-hidden relative p-4 order-2 lg:order-2">
        <div className="absolute top-6 left-6 z-50">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "DE" | "ENG")}
            className="bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="DE">DE</option>
            <option value="ENG">ENG</option>
          </select>
        </div>
        <motion.div
          className="absolute w-48 h-48 lg:w-72 lg:h-72 rounded-full bg-orange-400/20 top-10 left-10"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-yellow-400/20 bottom-10 right-10"
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-sm lg:max-w-md rounded-2xl bg-white/10 p-6 lg:p-8 shadow-2xl backdrop-blur-xl border border-white/20 my-4 lg:my-0"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-6 lg:mb-8"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="mx-auto mb-4 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg"
            >
              <FaHamburger size={24} className="lg:text-2xl" />
            </motion.div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {t("login.welcomeBack", "Welcome Back")}
            </h1>
            <p className="text-sm text-yellow-100 mt-2">
              {t(
                "login.signInToAccessAccount",
                "Sign in to your administrator account"
              )}
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/30 border border-red-500/40 rounded-lg flex items-center gap-2 text-red-100 text-sm"
            >
              <FaExclamationTriangle className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 lg:space-y-6">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-200" />
              <input
                type="email"
                placeholder={t("login.emailPlaceholder", "Email address")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-orange-300 bg-white/10 py-2 lg:py-3 pl-10 pr-4 text-white placeholder-yellow-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/40 outline-none text-sm lg:text-base transition-colors"
                required
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-200" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("login.passwordPlaceholder", "Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-orange-300 bg-white/10 py-2 lg:py-3 pl-10 pr-10 text-white placeholder-yellow-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 outline-none text-sm lg:text-base transition-colors"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-200 hover:text-white transition-colors"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </motion.div>

            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm text-yellow-100 hover:text-white transition-colors"
              >
                {t("login.forgotPassword", "Forgot password?")}
              </a>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 py-2 lg:py-3 text-base lg:text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:from-orange-600 hover:to-yellow-600"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                  {t("login.signingIn", "Signing in...")}
                </div>
              ) : (
                t("login.signInButton", "Sign In")
              )}
            </motion.button>
          </form>

          <div className="my-4 lg:my-6 flex items-center justify-center space-x-4">
            <div className="h-px w-1/4 bg-orange-300"></div>
            <span className="text-sm text-yellow-100">
              {t("login.or", "OR")}
            </span>
            <div className="h-px w-1/4 bg-orange-300"></div>
          </div>

          <motion.div
            className="flex flex-col space-y-3 lg:space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/20 py-2 lg:py-3 text-white shadow-md hover:bg-white/30 transition text-sm lg:text-base border border-orange-200/30"
            >
              <img
                src="/assets/images/google.svg"
                alt="Google"
                className="h-4 w-4 lg:h-5 lg:w-5"
              />
              {t("login.signInWithGoogle", "Sign in with Google")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/20 py-2 lg:py-3 text-white shadow-md hover:bg-white/30 transition text-sm lg:text-base border border-orange-200/30"
            >
              <img
                src="/assets/images/apple.svg"
                alt="Apple"
                className="h-4 w-4 lg:h-5 lg:w-5"
              />
              {t("login.signInWithApple", "Sign in with Apple")}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
