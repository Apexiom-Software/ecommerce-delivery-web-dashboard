import React, { useState, useEffect } from "react";
import { ProductService } from "../services/productService";
import type { Product } from "../services/productService";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";

interface SearchProps {
  onBack: () => void;
}

const PAGE_SIZE = 8;

const Search: React.FC<SearchProps> = ({ onBack }) => {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts(0, PAGE_SIZE);
        setProducts(response.content);
        setTotalPages(Math.ceil(response.totalElements / PAGE_SIZE));
      } catch {
        setError(t("screens.search.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [t]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const searchProducts = async () => {
        setLoading(true);
        try {
          if (searchText.trim() === "") {
            const response = await ProductService.getAllProducts(
              page,
              PAGE_SIZE
            );
            setProducts(response.content);
            setTotalPages(Math.ceil(response.totalElements / PAGE_SIZE));
          } else {
            const response = await ProductService.filterProductsByName(
              searchText,
              page,
              PAGE_SIZE
            );
            setProducts(response.content);
            setTotalPages(Math.ceil(response.totalElements / PAGE_SIZE));
          }
        } catch {
          setError(t("screens.search.error"));
        } finally {
          setLoading(false);
        }
      };

      searchProducts();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchText, page, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">{t("screens.search.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center p-5">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-6 px-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="mr-2 bg-blue-600 rounded-xl p-3 w-12 h-12 flex justify-center items-center"
          aria-label={t("screens.allProducts.backA11yLabel")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
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
        </button>
        <div className="flex-1 border border-gray-300 px-4 py-3 rounded-xl mr-2">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-600"
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
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("screens.search.searchPlaceholder")}
                className="text-gray-500 px-2 flex-1 outline-none"
                autoFocus
                aria-label={t("screens.allProducts.searchA11yLabel")}
                aria-describedby={t("screens.allProducts.searchA11yHint")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-600">
          {searchText
            ? t("screens.search.resultsFor", { query: searchText })
            : t("screens.search.recommendedProducts")}
        </h2>
        <span className="text-xs text-gray-500">
          {products.length}{" "}
          {products.length === 1
            ? t("screens.search.product")
            : t("screens.search.products")}
        </span>
      </div>

      <div className="px-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 pb-10">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))
        ) : (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 flex justify-center items-center p-5">
            <p className="text-red-500 text-center">
              {searchText
                ? t("screens.search.noResults", { query: searchText })
                : t("screens.search.noProducts")}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2 pb-10">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
          >
            {t("screens.allProducts.paginationPrev")}
          </button>

          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">
              {t("common.page")} {page + 1} {t("common.of")} {totalPages}
            </span>
          </div>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
          >
            {t("screens.allProducts.paginationNext")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
