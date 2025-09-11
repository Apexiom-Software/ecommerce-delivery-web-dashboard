import React, { useState, useEffect } from "react";
import { ProductService } from "../services/productService";
import type { Product } from "../services/productService";
import { CategoryService } from "../services/categoryService";
import type { Category } from "../services/categoryService";
import Search from "../components/Search";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/SideBar";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 8;
const PAGE_STORAGE_KEY = "products_currentPage";

const ListProducts: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
    return savedPage ? parseInt(savedPage, 10) : 0;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const categoriesData = await CategoryService.getCategories();
        const enabledCategories = categoriesData.filter(
          (category) => !category.isDisabled
        );
        setCategories(enabledCategories);

        let response;
        if (selectedCategory === null) {
          response = await ProductService.getAllProducts(page, PAGE_SIZE);
        } else {
          response = await ProductService.getProductsByCategoryId(
            selectedCategory,
            page,
            PAGE_SIZE
          );
        }

        setProducts(response.content);
        setTotalPages(Math.ceil(response.totalElements / PAGE_SIZE));
      } catch (error) {
        console.error(t("screens.allProducts.errorLoadProducts"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, page, t]);

  // Sauvegarder la page actuelle dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, page.toString());
  }, [page]);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(0);
    // Sauvegarder aussi la réinitialisation à la page 0
    localStorage.setItem(PAGE_STORAGE_KEY, "0");
  };

  if (showSearch) {
    return <Search onBack={() => setShowSearch(false)} />;
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
                  {selectedCategory === null
                    ? t("tab.home.all")
                    : categories.find((c) => c.categoryId === selectedCategory)
                        ?.name || t("screens.allProducts.products")}
                </h1>
                <span className="text-sm text-gray-500">
                  ({products.length}{" "}
                  {products.length === 1
                    ? t("tab.cart.itemSingular")
                    : t("tab.cart.itemPlural")}
                  )
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowSearch(true)}
              className="bg-white border border-gray-300 rounded-lg p-2 flex items-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label={t("screens.search.searchPlaceholder")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700">
              {t("common.categories")}
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="inline-flex space-x-3">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`flex flex-col items-center px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[80px] ${
                  selectedCategory === null
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    selectedCategory === null ? "bg-blue-500" : "bg-gray-100"
                  }`}
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <span className="font-medium">{t("tab.home.all")}</span>
              </button>

              {categories.map((category) => (
                <button
                  key={category.categoryId}
                  onClick={() => handleCategorySelect(category.categoryId)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[90px] ${
                    selectedCategory === category.categoryId
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full overflow-hidden mb-2 flex items-center justify-center ${
                      selectedCategory === category.categoryId
                        ? "ring-2 ring-blue-300 ring-offset-2"
                        : ""
                    }`}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-400"
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
                      </div>
                    )}
                  </div>
                  <span className="font-medium max-w-[70px] truncate">
                    {category.name.length > 10
                      ? category.name.substring(0, 8) + "..."
                      : category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600 text-sm">
                  {t("screens.allProducts.loading")}
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
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
                {selectedCategory !== null
                  ? t("screens.allProducts.noProductsContext.category", {
                      category: categories.find(
                        (c) => c.categoryId === selectedCategory
                      )?.name,
                    })
                  : t("screens.allProducts.noProductsContext.all")}
              </p>
              {selectedCategory !== null && (
                <button
                  onClick={() => handleCategorySelect(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t("tab.home.viewAll")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.productId} product={product} />
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
      </div>
    </div>
  );
};

export default ListProducts;
