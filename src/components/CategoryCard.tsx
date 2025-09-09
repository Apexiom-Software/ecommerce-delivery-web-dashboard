import React, { useState, useEffect } from "react";
import type { Category } from "../services/categoryService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "./ConfirmationModal";

interface CategoryCardProps {
  category: Category;
  onViewDetails?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const imageSource = category.image ? category.image : null;

  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit?.(category);
    navigate(`/edit-category/${category.categoryId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(category.categoryId!);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div
        className={`w-full mb-4 transition-all duration-500 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } ${category.isDisabled ? "opacity-60" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
          {category.isDisabled && (
            <div className="absolute top-3 right-3 z-20 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              {t("dashboardScreens.categories.disabled")}
            </div>
          )}

          <div className="relative flex-shrink-0 overflow-hidden">
            {imageSource ? (
              <img
                src={imageSource}
                alt={category.name}
                className={`w-full h-48 md:h-56 object-cover transition-transform duration-700 ${
                  isHovered ? "scale-110" : "scale-100"
                } ${category.isDisabled ? "grayscale-[30%]" : ""}`}
              />
            ) : (
              <div
                className={`w-full h-48 md:h-56 flex items-center justify-center ${
                  category.isDisabled
                    ? "bg-gradient-to-br from-gray-200 to-gray-300"
                    : "bg-gradient-to-br from-blue-50 to-indigo-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-16 w-16 ${
                    category.isDisabled ? "text-gray-400" : "text-indigo-300"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            )}

            <div
              className={`pointer-events-none absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <div className="relative z-10 p-3 md:p-4 flex-1 flex flex-col">
            <div className="mb-2">
              <h3
                className={`text-sm md:text-base font-semibold line-clamp-2 leading-tight transition-colors duration-300 ${
                  isHovered && !category.isDisabled
                    ? "text-indigo-600"
                    : category.isDisabled
                    ? "text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {category.name}
              </h3>
            </div>

            {category.description && (
              <div className="mb-3">
                <p
                  className={`text-xs md:text-sm line-clamp-2 leading-relaxed ${
                    category.isDisabled ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {category.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="relative z-20 flex gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  aria-label={t("dashboardScreens.productDetails.editProduct")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-700"
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

                {!category.isDisabled && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-50 transition-colors duration-200"
                    aria-label={t(
                      "dashboardScreens.productDetails.deleteProduct"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-red-600"
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
                )}
              </div>
            </div>
          </div>

          <div
            className={`pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 ${
              isHovered && !category.isDisabled ? "border-indigo-300" : ""
            }`}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("dashboardScreens.productDetails.deleteProductTitle")}
        message={t("dashboardScreens.productDetails.deleteProductConfirm")}
        confirmText={t("dashboardScreens.productDetails.deleteProduct")}
        isLoading={isDeleting}
      />
    </>
  );
};

export default CategoryCard;
