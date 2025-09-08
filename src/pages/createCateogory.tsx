import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import AnimatedAlert from "../components/AnimatedAlert";
import Sidebar from "../components/SideBar";
import { CategoryService } from "../services/categoryService";

const CreateCategory: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [category, setCategory] = useState({
    name: "",
    description: "",
    listingOrder: "",
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showAlertMessage = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value || !value.trim()) {
          return t(
            "dashboardScreens.createCategory.validationErrors.nameRequired"
          );
        }
        return "";
      case "listingOrder":
        if (
          value &&
          (isNaN(Number(value)) ||
            Number(value) <= 0 ||
            !Number.isInteger(Number(value)))
        ) {
          return t(
            "dashboardScreens.createCategory.validationErrors.listingOrderMustBeInteger"
          );
        }
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setCategory((prev) => ({ ...prev, [field]: value }));

    // Clear field error if it exists
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const nameError = validateField("name", category.name);
    if (nameError) errors.name = nameError;

    const listingOrderError = validateField(
      "listingOrder",
      category.listingOrder
    );
    if (listingOrderError) errors.listingOrder = listingOrderError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Prepare category data
      const categoryData = {
        name: category.name.trim(),
        description: category.description.trim() || undefined,
        listingOrder: category.listingOrder
          ? parseInt(category.listingOrder, 10)
          : undefined,
      };

      formData.append(
        "categoryRequest",
        new Blob([JSON.stringify(categoryData)], { type: "application/json" })
      );

      // Add image if available
      if (imageUri) {
        if (imageUri.startsWith("data:")) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append("categoryPhotoFile", blob, "category-image.jpg");
        } else {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const filename = imageUri.split("/").pop() || "category-image.jpg";
          formData.append("categoryPhotoFile", blob, filename);
        }
      }

      await CategoryService.createCategory(formData);

      showAlertMessage(
        t("dashboardScreens.createCategory.successTitle"),
        t("dashboardScreens.createCategory.successMessage")
      );

      setTimeout(() => {
        navigate("/categories");
      }, 2000);
    } catch (error: unknown) {
      showAlertMessage(
        t("dashboardScreens.createCategory.errorTitle"),
        (error as Error).message ||
          t("dashboardScreens.createCategory.errorMessage")
      );
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
        className={`flex-1 flex flex-col transition-all duration-300 lg:ml-64 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
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
                <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none mr-2">
                  {t("dashboardScreens.createCategory.title")}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-center">
                  {t("dashboardScreens.createCategory.title")}
                </h1>
                <div className="w-10"></div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.createCategory.name")} *
                </label>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    fieldErrors.name ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  placeholder={t(
                    "dashboardScreens.createCategory.namePlaceholder"
                  )}
                  disabled={loading}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600 animate-pulse">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.createCategory.description")}
                </label>
                <textarea
                  value={category.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder={t(
                    "dashboardScreens.createCategory.descriptionPlaceholder"
                  )}
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.createCategory.listingOrder")}
                </label>
                <input
                  type="text"
                  value={category.listingOrder}
                  onChange={(e) =>
                    handleFieldChange(
                      "listingOrder",
                      e.target.value.replace(/[^0-9]/g, "")
                    )
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${
                    fieldErrors.listingOrder
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  placeholder={t(
                    "dashboardScreens.createCategory.listingOrderPlaceholder"
                  )}
                  disabled={loading}
                />
                {fieldErrors.listingOrder && (
                  <p className="mt-1 text-sm text-red-600 animate-pulse">
                    {fieldErrors.listingOrder}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {t("dashboardScreens.createCategory.listingOrderHint")}
                </p>
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.createCategory.image")}
                </label>
                <ImageUploader
                  onImageSelected={setImageUri}
                  onRemoveImage={() => setImageUri(null)}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t("common.loading")}
                  </div>
                ) : (
                  t("dashboardScreens.createCategory.saveButton")
                )}
              </button>
            </div>
          </div>

          <AnimatedAlert
            visible={showAlert}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        </main>
      </div>
    </div>
  );
};

export default CreateCategory;
