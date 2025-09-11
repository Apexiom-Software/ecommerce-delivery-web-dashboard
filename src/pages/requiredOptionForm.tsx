/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRequiredOptionById,
  createRequiredOption,
  updateRequiredOption,
} from "../services/requiredOptionsService";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/SideBar";
import AnimatedAlert from "../components/AnimatedAlert";

const RequiredOptionForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    isDisabled: boolean;
  }>({
    name: "",
    isDisabled: false,
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchOption = async () => {
      try {
        const option = await getRequiredOptionById(Number(id));
        setFormData({
          name: option.name,
          isDisabled: option.isDisabled || false,
        });
      } catch {
        showErrorAlert(
          t("common.error"),
          t("dashboardScreens.requiredOptionsForm.errorLoadingMessage")
        );
      }
    };

    if (id) {
      fetchOption();
    }
  }, [id, t]);

  const showErrorAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleChange = (field: "name", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleDisable = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isDisabled: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showErrorAlert(
        t("dashboardScreens.requiredOptionsForm.validationErrorTitle"),
        t("dashboardScreens.requiredOptionsForm.validationErrorMessage")
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        isDisabled: formData.isDisabled,
      };

      if (id) {
        await updateRequiredOption(Number(id), payload);
        showErrorAlert(
          t("common.success"),
          t("dashboardScreens.requiredOptionsForm.updateSuccessMessage")
        );
      } else {
        await createRequiredOption(payload);
        showErrorAlert(
          t("common.success"),
          t("dashboardScreens.requiredOptionsForm.createSuccessMessage")
        );
      }
      setTimeout(() => {
        navigate("/required-options");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("dashboardScreens.requiredOptionsForm.errorMessage");
      showErrorAlert(t("common.error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex-1">
      <div className="fixed top-0 left-0 h-screen z-40 lg:z-auto">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 lg:ml-72 ${
          sidebarOpen ? "ml-72" : "ml-0"
        }`}
      >
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={t("common.openMenu")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                  title={t("common.back")}
                ></button>

                <h1 className="text-lg font-semibold text-gray-900">
                  {id
                    ? t("dashboardScreens.requiredOptionsForm.editTitle")
                    : t("dashboardScreens.requiredOptionsForm.createTitle")}
                </h1>
              </div>
            </div>

            <button
              onClick={() => navigate("/required-options")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t("common.cancel")}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboardScreens.requiredOptionsForm.nameLabel")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t(
                  "dashboardScreens.requiredOptionsForm.namePlaceholder"
                )}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {id && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("dashboardScreens.requiredOptionsForm.disableOption")}
                  </label>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-3">
                      {formData.isDisabled
                        ? t("dashboardScreens.categories.disabled")
                        : t("dashboardScreens.restaurant.available")}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDisabled}
                        onChange={(e) => handleToggleDisable(e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">
                  {t("dashboardScreens.requiredOptionsForm.disableHelpText")}
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span>
                  {id
                    ? t("dashboardScreens.requiredOptionsForm.updateButton")
                    : t("dashboardScreens.requiredOptionsForm.createButton")}
                </span>
              )}
            </button>
          </div>
        </main>

        <AnimatedAlert
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      </div>
    </div>
  );
};

export default RequiredOptionForm;
