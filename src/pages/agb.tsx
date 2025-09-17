import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaFileContract, FaHandshake } from "react-icons/fa";

const AGB = () => {
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
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -10,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring" as const,
        stiffness: 300
      }
    }
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
            {t("agb.back", "Back")}
          </motion.button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeLanguage("de")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${currentLanguage === "de" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-indigo-100"}`}
            >
              DE
            </button>
            <button
              onClick={() => changeLanguage("en")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${currentLanguage === "en" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-indigo-100"}`}
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
            {t("agb.title", "General Terms and Conditions (GTC)")}
          </h1>
          <p className="text-lg text-indigo-700 max-w-2xl mx-auto">
            {t("agb.subtitle", "As of July 2025 - Applicable to all contracts with entrepreneurs")}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Scope */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                <FaFileContract className="mr-3 text-indigo-500" />
                1. {t("agb.scopeTitle", "Scope")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  {t("agb.scopeText", "These General Terms and Conditions apply to all contracts between Apexiom and entrepreneurs within the meaning of Section 14 of the German Civil Code (BGB) who purchase digital services such as software development, app and web design, hosting, support, process automation or AI services.")}
                </p>
                <p>
                  {t("agb.individualAgreements", "Individual agreements take precedence over these Terms and Conditions.")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contracting party */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                <FaHandshake className="mr-3 text-indigo-500" />
                2. {t("agb.contractingPartyTitle", "Contracting party")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-medium">{t("agb.contractingParty", "Contracting party is:")}</p>
                <p>Apexiom – Mouad El Founti</p>
                <p>{t("agb.legalForm", "Sole proprietorship")}</p>
                <p>VAT ID: DE452532929</p>
                <p>Email: info@apexiom.de</p>
                <p>{t("agb.authorizedRepresentative", "Authorized representative")}: Mouad El Founti</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Conclusion of the contract */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                3. {t("agb.contractConclusionTitle", "Conclusion of the contract")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  {t("agb.contractConclusionText", "A contract is concluded through offer and acceptance in text form or through booking via online platforms such as Stripe.")}
                </p>
                <p>
                  {t("agb.stripeCheckout", "When using a Stripe checkout, the contract is concluded by clicking on 'Order with payment'.")}
                </p>
                <p>
                  {t("agb.contractStorage", "We do not permanently store the contract text. The contract language is German.")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Description of services */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                4. {t("agb.servicesTitle", "Description of services")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>{t("agb.servicesInclude", "Our services include:")}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>{t("agb.service1", "Development of websites, apps & software")}</li>
                  <li>{t("agb.service2", "Provision of hosting and server solutions")}</li>
                  <li>{t("agb.service3", "AI-based process optimization & automation")}</li>
                  <li>{t("agb.service4", "Digital consulting and individual IT solutions")}</li>
                </ul>
                <p>
                  {t("agb.noSuccessGuarantee", "A guarantee of success – especially for consulting services – is not given unless expressly agreed.")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Technical requirements */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                5. {t("agb.technicalRequirementsTitle", "Technical requirements")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  {t("agb.technicalRequirementsText", "The customer must ensure that the technical requirements for our services are met – in particular:")}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>{t("agb.requirement1", "working internet connection")}</li>
                  <li>{t("agb.requirement2", "current browsers")}</li>
                  <li>{t("agb.requirement3", "compatible hardware/software")}</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* Customer's obligation to cooperate */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                6. {t("agb.customerObligationTitle", "Customer's obligation to cooperate")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  {t("agb.customerObligationText", "The customer undertakes to provide all information, content, and access necessary for the provision of services in a timely manner. Timely approval of drafts, content, or technical components is also required. The customer must perform a data backup prior to data migration.")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Rights of Use / License Agreement */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                7. {t("agb.rightsOfUseTitle", "Rights of Use / License Agreement")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  {t("agb.rightsOfUseText", "The customer receives a simple, non-transferable right to use the delivered software solutions or content. Distribution, processing, or commercial exploitation without express permission is prohibited.")}
                </p>
                <p>
                  {t("agb.rightsViolation", "In case of violation, the permission to use the site will expire with immediate effect.")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Prices & Payment Terms */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                8. {t("agb.pricesTitle", "Prices & Payment Terms")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>{t("agb.pricesVat", "All prices are subject to statutory VAT.")}</p>
                <p>
                  {t("agb.billingMethods", "Billing is done either via Stripe or by invoice (payment methods: SEPA, credit card, etc.).")}
                </p>
                <p>{t("agb.paymentTerm", "Payment term: 7 days from invoice date.")}</p>
                <p>
                  {t("agb.latePayment", "In case of late payment, reminder fees of €5 per reminder as well as default interest according to §288 BGB will be charged.")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Additional sections would follow the same pattern */}

          {/* Final provisions */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
            >
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                20. {t("agb.finalProvisionsTitle", "Final provisions")}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  {t("agb.finalProvisionsText", "Should individual provisions of these Terms and Conditions be invalid in whole or in part, the validity of the remaining provisions shall remain unaffected.")}
                </p>
                <p>{t("agb.germanLaw", "Only German law applies.")}</p>
                <p>
                  {t("agb.jurisdiction", "The place of jurisdiction is the registered office of Apexiom (Hattingen), if legally permissible.")}
                </p>
                <p>{t("agb.contractLanguage", "The contract language is German.")}</p>
              </div>
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
          <p>© {new Date().getFullYear()} Apexiom. {t("agb.allRights", "All rights reserved")}.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AGB;