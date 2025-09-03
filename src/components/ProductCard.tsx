import React, { useState, useEffect } from "react";
import type { Product } from "../services/productService";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onEdit,
}) => {
  const navigate = useNavigate();
  const displayCalories = product.calories ?? 0;
  const formattedPrice = product.includeSizes
    ? (product.largeSizePrice ?? product.price ?? 0).toFixed(2)
    : (product.price ?? 0).toFixed(2);

  const imageSource = product.productPhoto
    ? product.productPhoto
    : product.photoBase64
    ? `data:image/png;base64,${product.photoBase64}`
    : null;

  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [promoPulse, setPromoPulse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (product.isPromoted) {
      const interval = setInterval(() => setPromoPulse((prev) => !prev), 1500);
      return () => clearInterval(interval);
    }
  }, [product.isPromoted]);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onViewDetails?.(product);
    navigate(`/product-details/${product.productId}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit?.(product);
    navigate(`/edit-product/${product.productId}`);
  };

  return (
    <div
      className={`w-full mb-4 transition-all duration-500 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${product.isDisabled ? "opacity-60" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Promotion Badge */}
        {product.isPromoted && (
          <div
            className={`absolute top-2 left-2 bg-red-600 px-2 py-1 rounded z-10 shadow-md ${
              promoPulse ? "animate-pulse" : ""
            } transition-all duration-500 pointer-events-none`}
          >
            <div className="flex items-center justify-center">
              <span className="text-white text-xs font-bold">PROMO</span>
            </div>
          </div>
        )}

        {/* Disabled Badge */}
        {product.isDisabled && (
          <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded z-10 shadow-md pointer-events-none">
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white mr-1"
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
              <span className="text-white text-xs font-bold">Disabled</span>
            </div>
          </div>
        )}

        {/* Image */}
        <div className="relative flex-shrink-0 overflow-hidden">
          {imageSource ? (
            <img
              src={imageSource}
              alt={product.name}
              className={`w-full h-48 md:h-56 object-cover transition-transform duration-700 ${
                isHovered ? "scale-110" : "scale-100"
              } ${product.isDisabled ? "grayscale" : ""}`}
            />
          ) : (
            <div className="w-full h-48 md:h-56 bg-gray-100 flex items-center justify-center">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Hover overlay (visual only) */}
          <div
            className={`pointer-events-none absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 p-3 md:p-4 flex-1 flex flex-col">
          <div className="mb-2">
            <h3
              className={`text-sm md:text-base font-semibold line-clamp-2 leading-tight transition-colors duration-300 ${
                isHovered ? "text-red-600" : "text-gray-900"
              } ${product.isDisabled ? "text-gray-500" : ""}`}
            >
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs md:text-sm flex items-center ${
                product.isDisabled ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 md:h-4 md:w-4 mr-1 text-gray-500"
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
              {product.category?.name || "No Category"}
            </span>
            <span
              className={`text-xs md:text-sm flex items-center font-medium ${
                product.isDisabled ? "text-gray-400" : "text-red-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5 mr-1 text-red-600"
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
              {displayCalories} kcal
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span
                className={`text-lg md:text-xl font-bold transition-all duration-300 ${
                  isHovered ? "text-red-700 scale-105" : "text-gray-900"
                } ${product.isDisabled ? "text-gray-500" : ""}`}
              >
                {formattedPrice}€
              </span>
              {product.includeSizes && (
                <span
                  className={`${
                    product.isDisabled
                      ? "bg-gray-400 text-gray-200"
                      : "bg-black text-white"
                  } px-2 py-1 rounded text-xs font-semibold`}
                >
                  Large
                </span>
              )}
            </div>

            {/* Actions - ensure on top of any overlays */}
            <div className="relative z-20 flex gap-2">
              <button
                type="button"
                onClick={handleViewDetails}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  product.isDisabled
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="Voir les détails"
                disabled={product.isDisabled}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${
                    product.isDisabled ? "text-gray-400" : "text-gray-700"
                  }`}
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
              </button>

              <button
                type="button"
                onClick={handleEdit}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  product.isDisabled
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="Modifier le produit"
                disabled={product.isDisabled}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${
                    product.isDisabled ? "text-gray-400" : "text-gray-700"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative border overlay (must not intercept clicks) */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 ${
            isHovered && !product.isDisabled ? "border-red-400" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default ProductCard;
