import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import AnimatedAlert from "../components/AnimatedAlert";
import Sidebar from "../components/SideBar";
import ConfirmationModal from "../components/ConfirmationModal";
import { CategoryService } from "../services/categoryService";

const EditCategory: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [category, setCategory] = useState({
    name: "",
    description: "",
    listingOrder: "",
    isDisabled: false,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  const showAlertMessage = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (!id) {
          showAlertMessage(
            t("dashboardScreens.updateCategory.errorTitle"),
            t("dashboardScreens.updateCategory.invalidId")
          );
          navigate("/categories");
          return;
        }

        const categoryData = await CategoryService.getCategoryById(
          parseInt(id)
        );

        setCategory({
          name: categoryData.name,
          description: categoryData.description || "",
          listingOrder:
            categoryData.listingOrder !== undefined &&
            categoryData.listingOrder !== null
              ? String(categoryData.listingOrder)
              : "",
          isDisabled: categoryData.isDisabled || false,
        });

        if (categoryData.image) {
          if (
            categoryData.image.startsWith("http") ||
            categoryData.image.startsWith("data:")
          ) {
            setCurrentImage(categoryData.image);
          } else {
            setCurrentImage(`data:image/jpeg;base64,${categoryData.image}`);
          }
        }
      } catch {
        showAlertMessage(
          t("dashboardScreens.updateCategory.loadErrorTitle"),
          t("dashboardScreens.updateCategory.loadErrorMessage")
        );
        navigate("/categories");
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id, navigate, t]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value || !value.trim()) {
          return t("dashboardScreens.updateCategory.nameRequired");
        }
        return "";
      case "listingOrder":
        if (
          value &&
          (isNaN(Number(value)) ||
            Number(value) <= 0 ||
            !Number.isInteger(Number(value)))
        ) {
          return t("dashboardScreens.updateCategory.listingOrderMustBeInteger");
        }
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setCategory((prev) => ({ ...prev, [field]: value }));

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

  const handleUpdateConfirm = async () => {
    setShowUpdateModal(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      const categoryData = {
        name: category.name.trim(),
        description: category.description.trim() || undefined,
        listingOrder: category.listingOrder
          ? parseInt(category.listingOrder, 10)
          : undefined,
        isDisabled: category.isDisabled,
        image: !newImage && !currentImage,
      };

      formData.append(
        "categoryRequest",
        new Blob([JSON.stringify(categoryData)], { type: "application/json" })
      );

      if (newImage) {
        if (newImage.startsWith("data:")) {
          const response = await fetch(newImage);
          const blob = await response.blob();
          formData.append("categoryPhotoFile", blob, "category-image.jpg");
        } else {
          const response = await fetch(newImage);
          const blob = await response.blob();
          const filename = newImage.split("/").pop() || "category-image.jpg";
          formData.append("categoryPhotoFile", blob, filename);
        }
      }

      if (!id) {
        throw new Error("Category ID is missing");
      }

      await CategoryService.updateCategory(parseInt(id), formData);

      showAlertMessage(
        t("dashboardScreens.updateCategory.successTitle"),
        t("dashboardScreens.updateCategory.successMessage")
      );

      setTimeout(() => {
        navigate("/categories");
      }, 2000);
    } catch (error: unknown) {
      showAlertMessage(
        t("dashboardScreens.updateCategory.errorTitle"),
        (error as Error).message ||
          t("dashboardScreens.updateCategory.errorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisableConfirm = async () => {
    setShowDisableModal(false);

    if (category.isDisabled) return;

    setLoading(true);

    try {
      const formData = new FormData();

      const categoryData = {
        name: category.name.trim(),
        description: category.description.trim() || undefined,
        listingOrder: category.listingOrder
          ? parseInt(category.listingOrder, 10)
          : undefined,
        isDisabled: true,
        image: !newImage && !currentImage,
      };

      formData.append(
        "categoryRequest",
        new Blob([JSON.stringify(categoryData)], { type: "application/json" })
      );

      if (newImage) {
        if (newImage.startsWith("data:")) {
          const response = await fetch(newImage);
          const blob = await response.blob();
          formData.append("categoryPhotoFile", blob, "category-image.jpg");
        } else {
          const response = await fetch(newImage);
          const blob = await response.blob();
          const filename = newImage.split("/").pop() || "category-image.jpg";
          formData.append("categoryPhotoFile", blob, filename);
        }
      }

      if (!id) {
        throw new Error("Category ID is missing");
      }

      await CategoryService.updateCategory(parseInt(id), formData);

      showAlertMessage(
        t("dashboardScreens.updateCategory.disableSuccessTitle"),
        t("dashboardScreens.updateCategory.disableSuccessMessage")
      );

      setTimeout(() => {
        navigate("/categories");
      }, 2000);
    } catch (error: unknown) {
      showAlertMessage(
        t("dashboardScreens.updateCategory.disableErrorTitle"),
        (error as Error).message ||
          t("dashboardScreens.updateCategory.disableErrorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
          <main className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center min-h-screen absolute inset-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {t("dashboardScreens.updateCategory.loadingText")}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                  {t("dashboardScreens.updateCategory.title")}
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
                  onClick={() => navigate("/categories")}
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
                  {t("dashboardScreens.updateCategory.title")}
                </h1>
                <div className="w-10"></div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.updateCategory.name")}
                </label>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    fieldErrors.name ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  placeholder={t(
                    "dashboardScreens.updateCategory.namePlaceholder"
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
                  {t("dashboardScreens.updateCategory.description")}
                </label>
                <textarea
                  value={category.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder={t(
                    "dashboardScreens.updateCategory.descriptionPlaceholder"
                  )}
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.updateCategory.listingOrder")}
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
                    "dashboardScreens.updateCategory.listingOrderPlaceholder"
                  )}
                  disabled={loading}
                />
                {fieldErrors.listingOrder && (
                  <p className="mt-1 text-sm text-red-600 animate-pulse">
                    {fieldErrors.listingOrder}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {t("dashboardScreens.updateCategory.listingOrderHint")}
                </p>
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.updateCategory.disableCategory")}
                </label>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.isDisabled}
                      onChange={(e) =>
                        handleFieldChange("isDisabled", e.target.checked)
                      }
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    {category.isDisabled
                      ? t("dashboardScreens.updateCategory.categoryDisabled")
                      : t("dashboardScreens.updateCategory.categoryEnabled")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {t("dashboardScreens.updateCategory.disableHelpText")}
                </p>
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.updateCategory.image")}
                </label>
                <ImageUploader
                  initialImage={currentImage}
                  onImageSelected={(uri) => {
                    setNewImage(uri);
                  }}
                  onRemoveImage={() => {
                    setNewImage(null);
                    setCurrentImage(null);
                  }}
                  removable
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                    loading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {t("dashboardScreens.updateCategory.saveButton")}
                </button>

                <button
                  onClick={() => setShowDisableModal(true)}
                  disabled={loading || category.isDisabled}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                    loading || category.isDisabled
                      ? "bg-gray-400 cursor-not-allowed text-gray-700"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {t("dashboardScreens.updateCategory.deleteCategory")}
                </button>
              </div>
            </div>
          </div>

          <AnimatedAlert
            visible={showAlert}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />

          <ConfirmationModal
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            onConfirm={handleUpdateConfirm}
            title={t("dashboardScreens.updateCategory.confirmChangesTitle")}
            message={t("dashboardScreens.updateCategory.confirmChangesMessage")}
            confirmText={t("common.confirm")}
            cancelText={t("common.cancel")}
            isLoading={loading}
          />

          <ConfirmationModal
            isOpen={showDisableModal}
            onClose={() => setShowDisableModal(false)}
            onConfirm={handleDisableConfirm}
            title={t("dashboardScreens.updateCategory.disableCategoryTitle")}
            message={t(
              "dashboardScreens.updateCategory.disableCategoryMessage"
            )}
            confirmText={t("common.disable")}
            cancelText={t("common.cancel")}
            isLoading={loading}
          />
        </main>
      </div>
    </div>
  );
};

export default EditCategory;
