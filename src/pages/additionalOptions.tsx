/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  getAllAdditionalOptions,
  deleteAdditionalOption,
  type AdditionalOptionResponse,
  type PaginatedAdditionalOptionResponse,
} from "../services/additionalOptionsService";
import Sidebar from "../components/SideBar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AdditionalOptionCard from "../components/AdditionalOptionCard";
import AnimatedAlert from "../components/AnimatedAlert";
import ConfirmationModal from "../components/ConfirmationModal";

const PAGE_SIZE = 8;
const PAGE_STORAGE_KEY = "additionalOptions_currentPage";

const ListAdditionalOptions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<AdditionalOptionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
    return savedPage ? parseInt(savedPage, 10) : 0;
  });

  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [optionToDelete, setOptionToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, page.toString());
  }, [page]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const response: PaginatedAdditionalOptionResponse =
          await getAllAdditionalOptions(page, PAGE_SIZE);

        setOptions(response.content);
        setTotalPages(response.totalPages);
      } catch {
        showAlertMessage(
          t("dashboardScreens.additionalOptionsList.loadErrorTitle"),
          t("dashboardScreens.additionalOptionsList.loadErrorMessage")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [page, t]);

  const showAlertMessage = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCreateOption = () => {
    navigate("/additional-option-form");
  };

  const confirmDeleteOption = (optionId: number) => {
    setOptionToDelete(optionId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOption = async () => {
    if (!optionToDelete) return;

    try {
      await deleteAdditionalOption(optionToDelete);

      if (options.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        const response: PaginatedAdditionalOptionResponse =
          await getAllAdditionalOptions(page, PAGE_SIZE);
        setOptions(response.content);
        setTotalPages(response.totalPages);
      }

      showAlertMessage(
        t("dashboardScreens.additionalOptionsList.deleteSuccessTitle"),
        t("dashboardScreens.additionalOptionsList.deleteSuccessMessage")
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        t("dashboardScreens.additionalOptionsList.deleteErrorMessage");
      showAlertMessage(
        t("dashboardScreens.additionalOptionsList.deleteErrorTitle"),
        errorMessage
      );
    } finally {
      setOptionToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setOptionToDelete(null);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem(PAGE_STORAGE_KEY);
    };
  }, []);

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
                  {t("dashboardScreens.additionalOptionsList.title")}
                </h1>
                <span className="text-sm text-gray-500">
                  ({options.length}{" "}
                  {options.length === 1
                    ? t("common.option")
                    : t("common.options")}
                  )
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateOption}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {t("dashboardScreens.additionalOptionsList.addOption")}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="flex justify-center items-center min-h-screen absolute inset-0">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600 text-sm">{t("common.loading")}</p>
              </div>
            </div>
          ) : options.length === 0 ? (
            <div className="flex flex-col justify-center items-center min-h-[300px] text-center px-4">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {t("dashboardScreens.additionalOptionsList.noOptionsFound")}
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                {t("dashboardScreens.additionalOptionsList.noOptionsContext")}
              </p>
              <button
                onClick={handleCreateOption}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {t("dashboardScreens.additionalOptionsList.addOption")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {options.map((option) => (
                  <AdditionalOptionCard
                    key={option.id}
                    option={option}
                    onDelete={confirmDeleteOption}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t("screens.allProducts.pagination.prev")}
                  </button>

                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600">
                      {t("common.page")} {page + 1} {t("common.of")}{" "}
                      {totalPages}
                    </span>
                  </div>

                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t("screens.allProducts.pagination.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          onConfirm={handleDeleteOption}
          title={t("dashboardScreens.additionalOptionForm.deleteConfirmTitle")}
          message={t(
            "dashboardScreens.additionalOptionForm.deleteConfirmMessage"
          )}
          confirmText={t("dashboardScreens.additionalOptionForm.delete")}
          cancelText={t("dashboardScreens.additionalOptionForm.cancel")}
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

export default ListAdditionalOptions;
