/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdditionalOptionById,
  createAdditionalOption,
  updateAdditionalOption,
} from "../services/additionalOptionsService";
import {
  AdditionalOptCategoryService,
  type AdditionalOptCategory,
} from "../services/additionalOptCategoriesService";
import Sidebar from "../components/SideBar";
import { useTranslation } from "react-i18next";
import AnimatedAlert from "../components/AnimatedAlert";
import ConfirmationModal from "../components/ConfirmationModal";

const AdditionalOptionAndCategoryForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState<AdditionalOptCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [categoryEditName, setCategoryEditName] = useState<string>("");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    unitPrice: "",
    additional_option_category_id: 0,
    isDisabled: false,
  });

  const showAlertMessage = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await AdditionalOptCategoryService.getAll();
      setCategories(data);
    } catch {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        t("dashboardScreens.additionalOptionForm.errorLoadCategories")
      );
    }
  }, [t, showAlertMessage]);

  const fetchOption = useCallback(async () => {
    try {
      setLoading(true);
      const option = await getAdditionalOptionById(Number(id));
      setFormData({
        name: option.name || "",
        unitPrice: option.unitPrice?.toString() || "",
        additional_option_category_id: option.additional_option_category_id,
        isDisabled: option.isDisabled || false,
      });
      setSelectedCategoryId(
        option.additional_option_category_id?.toString() || ""
      );
      setCategoryEditName(option.categoryName || "");
    } catch {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        t("dashboardScreens.additionalOptionForm.errorLoadOption")
      );
    } finally {
      setLoading(false);
    }
  }, [id, t, showAlertMessage]);

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      if (id) await fetchOption();
    };
    init();
  }, [id, fetchCategories, fetchOption]);

  const handleSubmitOption = async (e: React.FormEvent) => {
    e.preventDefault();

    const unitPriceNumber = parseFloat(formData.unitPrice);
    if (!formData.name || !selectedCategoryId || isNaN(unitPriceNumber)) {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.validationErrorTitle"),
        t("dashboardScreens.additionalOptionForm.validationErrorMessage")
      );
      return;
    }

    const payload = {
      name: formData.name.trim(),
      unitPrice: unitPriceNumber,
      additional_option_category_id: parseInt(selectedCategoryId),
      isDisabled: formData.isDisabled,
    };

    try {
      setLoading(true);
      if (isEditMode) {
        await updateAdditionalOption(Number(id), payload);
        showAlertMessage(
          t("dashboardScreens.additionalOptionForm.successTitle"),
          formData.isDisabled
            ? t("dashboardScreens.additionalOptionForm.successOptionDisabled")
            : t("dashboardScreens.additionalOptionForm.successOptionEnabled")
        );
      } else {
        await createAdditionalOption(payload);
        showAlertMessage(
          t("dashboardScreens.additionalOptionForm.successTitle"),
          t("dashboardScreens.additionalOptionForm.successOptionCreated")
        );
      }
      setTimeout(() => {
        navigate("/additional-options");
      }, 2000);
    } catch {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        t("dashboardScreens.additionalOptionForm.errorSaveOption")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        t("dashboardScreens.additionalOptionForm.errorEmptyCategoryName")
      );
      return;
    }
    try {
      setLoading(true);
      await AdditionalOptCategoryService.createCategory({
        name: newCategoryName.trim(),
      });
      setNewCategoryName("");
      await fetchCategories();
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.successTitle"),
        t("dashboardScreens.additionalOptionForm.successCategoryCreated")
      );
    } catch (error: any) {
      const message =
        error?.message ||
        t("dashboardScreens.additionalOptionForm.errorCreateCategory");
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategoryId || !categoryEditName.trim()) {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        t("dashboardScreens.additionalOptionForm.errorInvalidCategoryName")
      );
      return;
    }
    try {
      setLoading(true);
      const payload = { name: categoryEditName.trim() };
      const updatedCategory = await AdditionalOptCategoryService.updateCategory(
        parseInt(selectedCategoryId),
        payload
      );
      setCategories(
        categories.map((cat) =>
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      );
      setCategoryEditName(updatedCategory.name);
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.successTitle"),
        t("dashboardScreens.additionalOptionForm.successCategoryUpdated")
      );
      setIsEditingCategory(false);
    } catch {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        t("dashboardScreens.additionalOptionForm.errorUpdateCategory")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) return;

    try {
      setLoading(true);
      await AdditionalOptCategoryService.deleteCategory(
        parseInt(selectedCategoryId)
      );
      setSelectedCategoryId("");
      setCategoryEditName("");
      await fetchCategories();
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.successTitle"),
        t("dashboardScreens.additionalOptionForm.successCategoryDeletedCascade")
      );
    } catch {
      showAlertMessage(
        t("dashboardScreens.additionalOptionForm.errorTitle"),
        t("dashboardScreens.additionalOptionForm.errorDeleteCategory")
      );
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDeleteCategory = () => {
    if (!selectedCategoryId) return;
    setShowDeleteConfirm(true);
  };

  const cancelDeleteCategory = () => {
    setShowDeleteConfirm(false);
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
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-30 shadow-sm">
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
              <h1 className="text-lg font-semibold text-gray-900">
                {isEditMode
                  ? t("dashboardScreens.additionalOptionForm.titleEdit")
                  : t("dashboardScreens.additionalOptionForm.titleCreate")}
              </h1>
            </div>
            <button
              onClick={() => navigate("/additional-options")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t("common.cancel")}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <form
            onSubmit={handleSubmitOption}
            className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
          >
            {/* Category Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm mr-2">
                  1
                </span>
                {t("dashboardScreens.additionalOptionForm.step1")}
              </h2>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboardScreens.additionalOptionForm.selectCategory")}
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  const cat = categories.find(
                    (c) => c.id.toString() === e.target.value
                  );
                  setCategoryEditName(cat?.name || "");
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {t("dashboardScreens.additionalOptionForm.choosePlaceholder")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>

              {selectedCategoryId && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t(
                      "dashboardScreens.additionalOptionForm.editingCategory",
                      { category: categoryEditName }
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryEditName}
                      onChange={(e) => setCategoryEditName(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded"
                      disabled={!isEditingCategory}
                    />
                    <div className="flex gap-1">
                      {isEditingCategory ? (
                        <>
                          <button
                            type="button"
                            onClick={handleUpdateCategory}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingCategory(false)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsEditingCategory(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={confirmDeleteCategory}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-red-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t(
                    "dashboardScreens.additionalOptionForm.newCategoryPlaceholder"
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                    placeholder={t(
                      "dashboardScreens.additionalOptionForm.newCategoryPlaceholder"
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded "
                  >
                    {t(
                      "dashboardScreens.additionalOptionForm.addCategoryButton"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Option Details */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm mr-2">
                  2
                </span>
                {t("dashboardScreens.additionalOptionForm.step2")}
              </h2>

              {!selectedCategoryId && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {t("dashboardScreens.additionalOptionForm.warningNoCategory")}
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t(
                      "dashboardScreens.additionalOptionForm.optionNamePlaceholder"
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t(
                      "dashboardScreens.additionalOptionForm.optionNamePlaceholder"
                    )}
                    disabled={!selectedCategoryId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t(
                      "dashboardScreens.additionalOptionForm.unitPricePlaceholder"
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t(
                      "dashboardScreens.additionalOptionForm.unitPricePlaceholder"
                    )}
                    disabled={!selectedCategoryId}
                  />
                </div>

                {isEditMode && (
                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <label className="text-sm font-medium text-gray-700">
                      {t("dashboardScreens.additionalOptionForm.disableLabel")}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isDisabled: !formData.isDisabled,
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.isDisabled ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          formData.isDisabled ? "right-0.5" : "right-6"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedCategoryId || loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t("common.loading")}
                </span>
              ) : isEditMode ? (
                t("dashboardScreens.additionalOptionForm.updateOptionButton")
              ) : (
                t("dashboardScreens.additionalOptionForm.createOptionButton")
              )}
            </button>
          </form>
        </main>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDeleteCategory}
          onConfirm={handleDeleteCategory}
          title={t("dashboardScreens.additionalOptionForm.deleteConfirmTitle")}
          message={t(
            "dashboardScreens.additionalOptionForm.deleteConfirmMessageCascade"
          )}
          confirmText={t("dashboardScreens.additionalOptionForm.delete")}
          cancelText={t("dashboardScreens.additionalOptionForm.cancel")}
          isLoading={loading}
        />

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

export default AdditionalOptionAndCategoryForm;
