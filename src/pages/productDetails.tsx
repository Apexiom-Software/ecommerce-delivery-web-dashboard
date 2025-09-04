/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductService } from "../services/productService";
import {
  PromotionService,
  type PromotionResponse,
  type Rule,
} from "../services/promotionService";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/SideBar";

interface ProductDetailsProps {
  onClose?: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ onClose }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(true);
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionResponse | null>(null);
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        setError(t("screens.myProductDetails.productNotFound"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productData = await ProductService.getProductById(Number(id));
        setProduct(productData);
      } catch {
        setError(t("screens.myProductDetails.errorLoadProduct"));
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, t]);

  const fetchPromotions = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingPromotions(true);
      const promotionsData = await PromotionService.getPromotionByProductId(
        Number(id)
      );
      setPromotions(promotionsData);
    } catch (error: unknown) {
      console.error("Error loading promotions:", error);
    } finally {
      setIsLoadingPromotions(false);
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchPromotions();
    }
  }, [product, fetchPromotions]);

  useEffect(() => {
    if (!product) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking((prev) => !prev);
    }, 1000);

    return () => clearInterval(blinkInterval);
  }, [product]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const getImageSource = () => {
    if (product?.productPhoto) return product.productPhoto;
    if (product?.photoBase64)
      return `data:image/png;base64,${product.photoBase64}`;
    return null;
  };

  const getRuleValue = (rule: Rule): { [key: string]: any } => {
    if (typeof rule.ruleValue === "string") {
      try {
        return JSON.parse(rule.ruleValue);
      } catch {
        return {};
      }
    }
    return rule.ruleValue || {};
  };

  const isPromotionApplicableToProduct = (
    promotion: PromotionResponse,
    productId: number
  ): boolean => {
    return promotion.rules.some((rule) => {
      const ruleVal = getRuleValue(rule);
      return ruleVal.productId === productId;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
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
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("screens.myProductDetails.productNotFound")}
                </h2>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t("screens.myProductDetails.backToMenu")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageSource = getImageSource();

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
                <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none mr-2">
                  {t("screens.myProductDetails.productDetails")}
                </h1>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={t("common.close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18极6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                <div className="relative">
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                    {imageSource ? (
                      <img
                        src={imageSource}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isBlinking ? "opacity-100" : "opacity-70"
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 md:h-20 md:w-20 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 极6l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 极 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="transition-transform duration-300 hover:scale-105">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                      {product.name}
                    </h1>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.isDisabled && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full transition-transform duration-300 hover:scale-110">
                          {t("component.ui.myProductItem.disabled")}
                        </span>
                      )}
                      {product.isPromoted && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs极 md:text-sm font-medium px-2 md:px-3 py-1 rounded-full transition-transform duration-300 hover:scale-110">
                          {t("component.ui.myProductItem.promoBadge")}
                        </span>
                      )}
                    </div>
                  </div>

                  {isLoadingPromotions ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                    </div>
                  ) : promotions.length > 0 ? (
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-yellow-50 rounded-lg transition-transform duration-300 hover:scale-105">
                      <div className="bg-yellow-100 p-2 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 md:h-6 md:w-6 text-yellow-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 md:h-5 md:w-5 text-yellow-700 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          <p className="text-xs md:text-sm font-medium text-yellow-900">
                            {t("screens.myProductDetails.currentPromotion")}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {promotions.map((promotion) => (
                            <div
                              key={promotion.id}
                              className="bg-white p-3 rounded-lg border border-yellow-100 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-yellow-100 p-2 rounded-full flex items-center justify-center mt-0.5">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-yellow-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                  </svg>
                                </div>

                                <div className="flex-1">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div>
                                      <p className="font-medium text-yellow-800 flex items-center">
                                        {promotion.name}
                                      </p>

                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <div className="flex items-center bg-yellow-100/70 px-2 py-1 rounded-md text-xs">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3 text-yellow-700 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                          </svg>
                                          <span className="text-yellow-700 font-medium">
                                            {new Date(
                                              promotion.startDate
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>

                                        <div className="flex items-center">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3 text-yellow-500 mx-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                                            />
                                          </svg>
                                        </div>

                                        <div className="flex items-center bg-yellow-100/70 px-2 py-1 rounded-md text-xs">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3 text-yellow-700 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                          </svg>
                                          <span className="text-yellow-700 font-medium">
                                            {new Date(
                                              promotion.endDate
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => {
                                        setSelectedPromotion(promotion);
                                        setIsPromoModalVisible(true);
                                      }}
                                      className="flex items-center px-3 py-1.5 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors shadow-sm"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5 mr-1.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      {t("screens.myProductDetails.seeDetails")}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-blue-50 rounded-lg transition-transform duration-300 hover:scale-105">
                    <svg
                      xmlns="http://www.w3.org/2000/s极"
                      className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-blue-900">
                        {t("screens.myProductDetails.categoryLabel")}
                      </p>
                      <p className="text-blue-700 text-sm md:text-base">
                        {product.category?.name ||
                          t("component.ui.myProductItem.noCategory")}
                      </p>
                    </div>
                  </div>

                  {product.includeSizes ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 md:p-4 bg-purple-50 rounded-lg transition-transform duration-300 hover:scale-105">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 md:h-6 md:w-6 text-purple-600 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs md:text-sm font-medium text-purple-900 mb-2">
                            {t("screens.myProductDetails.sizes")}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {product.smallSizePrice > 0 && (
                              <div className="flex flex-col bg-white/50 p-2 rounded transition-transform duration-300 hover:scale-105">
                                <span className="text-xs text-purple-700">
                                  {t("screens.myProductDetails.sizeSmall")}
                                </span>
                                <span className="font-semibold text-purple-900 text-sm md:text-base">
                                  €{product.smallSizePrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {product.mediumSizePrice > 0 && (
                              <div className="flex flex-col bg-white/50 p-2 rounded transition-transform duration-300 hover:scale-105">
                                <span className="text-xs text-purple-700">
                                  {t("screens.myProductDetails.sizeMedium")}
                                </span>
                                <span className="font-semibold text-purple-900 text-sm md:text-base">
                                  €{product.mediumSizePrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {product.largeSizePrice > 0 && (
                              <div className="flex flex-col bg-white/50 p-2 rounded transition-transform duration-300 hover:scale-105">
                                <span className="text-xs text-purple-700">
                                  {t("screens.myProductDetails.sizeLarge")}
                                </span>
                                <span className="font-semibold text-purple-900 text-sm md:text-base">
                                  €{product.largeSizePrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 md:p-4 bg-purple-50 rounded-lg transition-transform duration-300 hover:scale-105">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 md:h-6 md:w-6 text-purple-600 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 3 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs md:text-sm font-medium text-purple-900">
                          {t("screens.myProductDetails.price")}
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-purple-900 transition-transform duration-300 hover:scale-110">
                          €{product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  {product.calories > 0 && (
                    <div className="flex items-center gap-3 p-3 md:p-4 bg-orange-50 rounded-lg transition-transform duration-300 hover:scale-105">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 md:h-6 md:w-6 text-orange-600 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 012.343 5.657z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs md:text-sm font-medium text-orange-900">
                          {t("screens.myProductDetails.calories")}
                        </p>
                        <p className="text-orange-700 text-sm md:text-base transition-transform duration-300 hover:scale-110">
                          {product.calories} kcal
                        </p>
                      </div>
                    </div>
                  )}

                  {product.description && (
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-green-50 rounded-lg transition-transform duration-300 hover:scale-105">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs md:text-sm font-medium极 text-green-900 mb-2">
                          {t("screens.myProductDetails.descriptionTitle")}
                        </p>
                        <p className="text-green-700 text-sm md:text-base transition-transform duration-300 hover:scale-105">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {product.requiredOptions &&
                    product.requiredOptions.length > 0 && (
                      <div className="flex items-start gap-3 p-3 md:p-4 bg-red-50 rounded-lg transition-transform duration-300 hover:scale-105">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 md:h-6 md:w-6 text-red-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m极 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs md:text-sm font-medium text-red-900 mb-2">
                            {t("screens.myProductDetails.requiredOptions")}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {product.requiredOptions.map((option: any) => (
                              <div
                                key={option.id}
                                className="bg-white/50 p-2 md:p-3 rounded transition-transform duration-300 hover:scale-105"
                              >
                                <span className="text-red-700 text-xs md:text-sm break-words">
                                  {option.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {product.additionalOptions &&
                product.additionalOptions.length > 0 && (
                  <div className="mt-6 md:mt-8 transition-transform duration-300 hover:scale-105">
                    <div className="flex items-center gap-3 p-3极 p-4 bg-indigo-50 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium text-indigo-900 mb-2">
                          {t("screens.myProductDetails.additionalOptionsTitle")}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          {product.additionalOptions.map((option: any) => (
                            <div
                              key={option.id}
                              className="flex justify-between items-center bg-white/50 p-2 md:p-3 rounded transition-transform duration-300 hover:scale-105"
                            >
                              <span className="text-indigo-700 text-xs md:text-sm break-words flex-1 mr-2">
                                {option.name}
                              </span>
                              <span className="text-indigo-900 font-medium text-xs md:text-sm whitespace-nowrap">
                                +€{option.unitPrice.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {isPromoModalVisible && selectedPromotion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
                <div className="p-6">
                  {/* En-tête avec icône */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-yellow-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {selectedPromotion.name}
                      </h3>
                    </div>
                    <div
                      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedPromotion.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedPromotion.isActive ? (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {t("screens.myProductDetails.active")}
                        </>
                      ) : (
                        <>
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          {t("screens.myProductDetails.inactive")}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4v3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-700">
                        {t("screens.myProductDetails.promotionPeriod")}
                      </h4>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm mb-2 md:mb-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {t("screens.myProductDetails.from")}
                        </span>
                        <span className="ml-2 text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {new Date(
                            selectedPromotion.startDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 mx-2 hidden md:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>

                      <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {t("screens.myProductDetails.to")}
                        </span>
                        <span className="ml-2 text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                          {new Date(
                            selectedPromotion.endDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Détails de réduction avec design amélioré */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7极0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 极 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-700">
                        {t("screens.myProductDetails.discountDetails")}
                      </h4>
                    </div>

                    {isPromotionApplicableToProduct(
                      selectedPromotion,
                      product.productId
                    ) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedPromotion.actions.map((action, index) => (
                          <div
                            key={index}
                            className={`flex items-center p-3 rounded-lg border ${
                              action.actionType === "FREE_ITEM"
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-full mr-3 ${
                                action.actionType === "FREE_ITEM"
                                  ? "bg-green-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              {action.actionType === "PERCENT_OFF" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4极.01M9 16h6"
                                  />
                                </svg>
                              ) : action.actionType === "FIXED_OFF" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0极"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p
                                className={`font-semibold ${
                                  action.actionType === "FREE_ITEM"
                                    ? "text-green-800"
                                    : "text-blue-800"
                                }`}
                              >
                                {action.actionType === "PERCENT_OFF" &&
                                  `${action.actionValue?.percentage}% ${t(
                                    "screens.myProductDetails.off"
                                  )}`}
                                {action.actionType === "FIXED_OFF" &&
                                  `€${action.actionValue?.amount} ${t(
                                    "screens.myProductDetails.off"
                                  )}`}
                                {action.actionType === "FREE_ITEM" &&
                                  `${t("screens.myProductDetails.freeItem")}`}
                              </p>
                              <p
                                className={`text-xs ${
                                  action.actionType === "FREE_ITEM"
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {action.actionType === "PERCENT_OFF"
                                  ? t(
                                      "screens.myProductDetails.percentageDiscount"
                                    )
                                  : action.actionType === "FIXED_OFF"
                                  ? t("screens.myProductDetails.fixedDiscount")
                                  : t(
                                      "screens.myProductDetails.freeItemDescription"
                                    )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <p className="text-gray-500 italic">
                          {t("screens.myProductDetails.noDiscountApplicable")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bouton de fermeture avec icône */}
                  <button
                    onClick={() => setIsPromoModalVisible(false)}
                    className="w-full flex items-center justify-center mt-4 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {t("screens.myProductDetails.close")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductDetails;
