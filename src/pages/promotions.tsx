/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  PromotionService,
  type PromotionResponse,
} from "../services/promotionService";
import Sidebar from "../components/SideBar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PromotionCard from "../components/promotionCard";
import AnimatedAlert from "../components/AnimatedAlert";
import ConfirmationModal from "../components/ConfirmationModal";

const PAGE_SIZE = 3;
const PAGE_STORAGE_KEY = "promotions_currentPage";

const ListPromotions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
    return savedPage ? parseInt(savedPage, 10) : 0;
  });

  // États pour la modale de confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<number | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, page.toString());
  }, [page]);

  const loadPromotions = async (
    pageNum: number = 0,
    reset: boolean = false
  ) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const response = await PromotionService.getAllPromotions(
        pageNum,
        PAGE_SIZE
      );

      if (reset) {
        setPromotions(response.content);
      } else {
        const existingIds = new Set(
          promotions.map((promotion) => promotion.id)
        );
        const newPromotions = response.content.filter(
          (promotion) => !existingIds.has(promotion.id)
        );
        setPromotions([...promotions, ...newPromotions]);
      }

      setTotalPages(response.totalPages);
      setPage(pageNum);
    } catch {
      showAlertMessage(
        t("common.error"),
        t("dashboardScreens.promotions.loadError")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions(0, true);
  }, []);

  const showAlertMessage = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCreatePromotion = () => {
    navigate("/create-promotion");
  };

  const handleDeleteClick = (id: number) => {
    setPromotionToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;

    setDeleteLoading(true);
    try {
      await PromotionService.deletePromotion(promotionToDelete);
      setPromotions(promotions.filter((p) => p.id !== promotionToDelete));
      showAlertMessage(
        t("common.success"),
        t("dashboardScreens.promotions.deleteSuccess")
      );
      setTimeout(() => {
        navigate("/promotions");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("dashboardScreens.promotions.deleteError");
      showAlertMessage(t("common.error"), errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setPromotionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPromotionToDelete(null);
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
                  {t("dashboardScreens.promotions.title")}
                </h1>
                <span className="text-sm text-gray-500">
                  ({promotions.length}{" "}
                  {promotions.length === 1
                    ? t("common.promotion")
                    : t("common.promotions")}
                  )
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreatePromotion}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t("dashboardScreens.promotions.addPromotion")}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3">
          {loading && promotions.length === 0 ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                <p className="text-gray-600 text-sm">{t("common.loading")}</p>
              </div>
            </div>
          ) : promotions.length === 0 ? (
            <div className="flex flex-col justify-center items-center min-h-[300px] text-center px-4">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {t("dashboardScreens.promotions.noPromotions")}
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                {t("dashboardScreens.promotions.noPromotionsContext")}
              </p>
              <button
                onClick={handleCreatePromotion}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                {t("dashboardScreens.promotions.createFirst")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    onDelete={handleDeleteClick}
                    onEdit={() => navigate(`/update-promotion/${promotion.id}`)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-2 space-x-2">
                  <button
                    disabled={page === 0}
                    onClick={() => loadPromotions(page - 1, true)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    {t("common.previous")}
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum = page;
                      if (totalPages > 5) {
                        const startPage = Math.max(
                          0,
                          Math.min(page - 2, totalPages - 5)
                        );
                        pageNum = startPage + i;
                      } else {
                        pageNum = i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => loadPromotions(pageNum, true)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    {totalPages > 5 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </div>

                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => loadPromotions(page + 1, true)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium flex items-center"
                  >
                    {t("common.next")}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <AnimatedAlert
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />

        {/* Modale de confirmation de suppression */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title={t("dashboardScreens.promotions.deleteTitle")}
          message={t("dashboardScreens.promotions.deleteMessage")}
          confirmText={t("common.delete")}
          cancelText={t("common.cancel")}
          isLoading={deleteLoading}
        />
      </div>
    </div>
  );
};

export default ListPromotions;
