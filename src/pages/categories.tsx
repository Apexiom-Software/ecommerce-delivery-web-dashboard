import React, { useState, useEffect } from "react";
import { CategoryService } from "../services/categoryService";
import type { Category } from "../services/categoryService";
import Sidebar from "../components/SideBar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import AnimatedAlert from "../components/AnimatedAlert";

const PAGE_SIZE = 8;
const PAGE_STORAGE_KEY = "categories_currentPage";

const ListCategories: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, page.toString());
  }, [page]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await CategoryService.getCategories();

        const startIndex = page * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedCategories = categoriesData.slice(startIndex, endIndex);

        setCategories(paginatedCategories);
        setTotalPages(Math.ceil(categoriesData.length / PAGE_SIZE));
      } catch (error) {
        console.error(t("screens.allProducts.errorLoadCategories"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t, page]);

  const showAlertMessage = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCreateCategory = () => {
    navigate("/create-category");
  };

  const handleEditCategory = (category: Category) => {
    navigate(`/update-category/${category.categoryId}`);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await CategoryService.deleteCategory(categoryId);
      setCategories(categories.filter((cat) => cat.categoryId !== categoryId));
      showAlertMessage(
        t("dashboardScreens.productDetails.successTitle"),
        t("dashboardScreens.productDetails.productDeleted")
      );
    } catch {
      showAlertMessage(
        t("dashboardScreens.productDetails.errorTitle"),
        t("dashboardScreens.productDetails.errorMessage")
      );
    }
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
                  {t("sidebar.categoriesList")}
                </h1>
                <span className="text-sm text-gray-500">
                  ({categories.length}{" "}
                  {categories.length === 1
                    ? t("common.category")
                    : t("common.categories")}
                  )
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateCategory}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center"
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
              {t("sidebar.addCategory")}
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
          ) : categories.length === 0 ? (
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16M9 9h6m-6 4h6m-6 4h6"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {t("screens.allProducts.noProducts")}
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                {t("screens.allProducts.noProductsContext.all")}
              </p>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium"
              >
                {t("sidebar.addCategory")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.categoryId}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
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

export default ListCategories;
