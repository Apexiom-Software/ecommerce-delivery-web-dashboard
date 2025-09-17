import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaChild,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Impressum = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const, // Specify as const to ensure type safety
        stiffness: 100,
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -10,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring" as const, // Specify as const to ensure type safety
        stiffness: 300,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header avec navigation */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring" as const, stiffness: 100 }}
          className="flex justify-between items-center mb-12"
        >
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="flex items-center text-indigo-600 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            {t("impressum.back", "Back")}
          </motion.button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeLanguage("de")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                currentLanguage === "de"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-indigo-100"
              }`}
            >
              DE
            </button>
            <button
              onClick={() => changeLanguage("en")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                currentLanguage === "en"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-indigo-100"
              }`}
            >
              EN
            </button>
          </div>
        </motion.div>

        {/* Titre principal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" as const, stiffness: 100, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            {t("impressum.title", "Legal Notice & Privacy Policy")}
          </h1>
          <p className="text-lg text-indigo-700 max-w-2xl mx-auto">
            {t(
              "impressum.subtitle",
              "Transparency and data protection are important to us. Here you will find all the necessary legal information."
            )}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Informations de contact */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-3 text-indigo-500" />
                {t("impressum.contactTitle", "Contact Information")}
              </h2>
              <div className="space-y-3">
                <p className="text-lg font-medium text-gray-800">Apexiom</p>
                <p className="text-gray-600 flex items-center">
                  <span className="inline-block w-6">
                    <FaMapMarkerAlt className="text-indigo-400" />
                  </span>
                  {t("impressum.owner", "Owner")}: Mouad El Founti
                </p>
                <p className="text-gray-600 flex items-center">
                  <span className="inline-block w-6">
                    <FaMapMarkerAlt className="text-indigo-400" />
                  </span>
                  Oststraße 18, 45525 Hattingen
                </p>
                <p className="text-gray-600 flex items-center">
                  <span className="inline-block w-6">
                    <FaPhone className="text-indigo-400" />
                  </span>
                  +49 (0) 23249210864
                </p>
                <p className="text-gray-600 flex items-center">
                  <span className="inline-block w-6">
                    <FaEnvelope className="text-indigo-400" />
                  </span>
                  info@apexiom.de
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Informations légales */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                {t("impressum.legalInfo", "Legal Information")}
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>
                    {t(
                      "impressum.accordingTo",
                      "Information according to § 5 TMG"
                    )}
                  </strong>
                </p>
                <p>
                  <strong>
                    {t(
                      "impressum.responsibleContent",
                      "Responsible for the content according to § 55 para. 2 RStV"
                    )}
                    :
                  </strong>
                  <br />
                  Mouad El Founti
                  <br />
                  Oststraße 18
                  <br />
                  45525 Hattingen
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Politique de confidentialité */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                <FaChild className="mr-3 text-indigo-500" />
                {t("impressum.privacyTitle", "Privacy Policy")}
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  {t(
                    "impressum.privacyIntro",
                    "The following information provides an overview of what happens to your personal data when you visit our website. Personal data is any data that can be used to identify you personally."
                  )}
                </p>

                <h3 className="text-lg font-medium text-indigo-700 mt-6 mb-2">
                  {t(
                    "impressum.dataCollection",
                    "How do we collect your data?"
                  )}
                </h3>
                <p>
                  <strong>
                    {t("impressum.activeData", "Active data transmission:")}
                  </strong>
                  <br />
                  {t(
                    "impressum.activeDataDesc",
                    "Data that you provide to us yourself, e.g. via a contact form or by email."
                  )}
                </p>
                <p>
                  <strong>
                    {t("impressum.automatedData", "Automated data:")}
                  </strong>
                  <br />
                  {t(
                    "impressum.automatedDataDesc",
                    "Other data is automatically collected by our IT systems when you visit the website. This primarily involves technical data (e.g., internet browser, operating system, or time of page access). This data is collected automatically as soon as you enter our website."
                  )}
                </p>

                <h3 className="text-lg font-medium text-indigo-700 mt-6 mb-2">
                  {t("impressum.dataUsage", "What do we use your data for?")}
                </h3>
                <p>
                  {t(
                    "impressum.dataUsageDesc",
                    "You have the right to obtain information about the origin, recipient, and purpose of your stored personal data at any time and free of charge. You also have the right to request the correction, blocking, or deletion of this data."
                  )}
                </p>

                <h3 className="text-lg font-medium text-indigo-700 mt-6 mb-2">
                  {t("impressum.cookiesTitle", "Cookies and third-party tools")}
                </h3>
                <p>
                  {t(
                    "impressum.cookiesDesc",
                    "Our website uses cookies and similar technologies to provide certain functions and analyze user behavior. These tools are used exclusively on the basis of your consent, unless technically necessary."
                  )}
                </p>

                <h3 className="text-lg font-medium text-indigo-700 mt-6 mb-2">
                  {t("impressum.rightsTitle", "Your rights as a data subject")}
                </h3>
                <p>
                  {t(
                    "impressum.rightsDesc",
                    "You have the right at any time to information about your stored data, correction, deletion or restriction of processing, data portability, objection to processing, and complaint to the supervisory authority."
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact pour la protection des données */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                <FaEnvelope className="mr-3 text-indigo-500" />
                {t(
                  "impressum.contactPrivacy",
                  "Contact for data protection inquiries"
                )}
              </h2>
              <p className="text-gray-700">
                {t(
                  "impressum.contactPrivacyDesc",
                  "If you have any questions about data protection, please contact:"
                )}
              </p>
              <p className="text-gray-700 mt-3">
                Mouad El Founti
                <br />
                Oststraße 18
                <br />
                45525 Hattingen
                <br />
                {t("impressum.email", "Email")}: info@apexiom.de
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-indigo-600"
        >
          <p>
            © {new Date().getFullYear()} Apexiom.{" "}
            {t("impressum.allRights", "All rights reserved")}.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Impressum;
