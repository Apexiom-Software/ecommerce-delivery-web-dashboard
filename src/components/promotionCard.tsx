import React, { useState } from "react";
import { type PromotionResponse } from "../services/promotionService";
import { useTranslation } from "react-i18next";

interface PromotionCardProps {
  promotion: PromotionResponse;
  onDelete: (id: number) => void;
  onEdit: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onDelete,
  onEdit,
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // Trouver l'action de réduction (s'il y en a une)
  const discountAction = promotion.actions.find(
    (action) =>
      action.actionType === "PERCENT_OFF" || action.actionType === "FIXED_OFF"
  );

  // Trouver l'action d'article gratuit (s'il y en a une)
  const freeItemAction = promotion.actions.find(
    (action) => action.actionType === "FREE_ITEM"
  );

  // Extraire la valeur de la réduction (gérer le cas où actionValue est un objet)
  const getDiscountValue = () => {
    if (!discountAction) return null;

    if (
      typeof discountAction.actionValue === "object" &&
      discountAction.actionValue !== null
    ) {
      // Si actionValue est un objet, essayez d'extraire la valeur
      return (
        discountAction.actionValue.percentage ||
        discountAction.actionValue.amount ||
        discountAction.actionValue.value
      );
    }

    // Si actionValue est une valeur primitive
    return discountAction.actionValue;
  };

  // Extraire les informations de l'article gratuit
  const getFreeItemInfo = () => {
    if (!freeItemAction) return null;

    if (
      typeof freeItemAction.actionValue === "object" &&
      freeItemAction.actionValue !== null
    ) {
      return {
        productName: freeItemAction.actionValue.productName,
        quantity: freeItemAction.actionValue.quantity,
      };
    }

    return null;
  };

  const freeItemInfo = getFreeItemInfo();
  const discountValue = getDiscountValue();

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {promotion.photoBase64 && (
        <div className="h-60 bg-gray-200 overflow-hidden">
          <img
            src={`data:image/jpeg;base64,${promotion.photoBase64}`}
            alt={promotion.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? "scale-110" : "scale-20"
            }`}
          />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-600"
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
            <h3 className="font-bold text-xl text-gray-800">
              {promotion.name}
            </h3>
          </div>
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              promotion.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {promotion.isActive ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
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
                {t("dashboardScreens.promotions.active")}
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
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
                {t("dashboardScreens.promotions.inactive")}
              </>
            )}
          </div>
        </div>

        {/* Période de validité */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-1 rounded-lg mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
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
            <h4 className="font-semibold text-sm text-gray-700">
              {t("dashboardScreens.promotions.validityPeriod")}
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm mb-2 sm:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-green-500 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10极3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">
                {t("dashboardScreens.promotions.from")}
              </span>
              <span className="ml-1 text-xs font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                {new Date(promotion.startDate).toLocaleDateString()}
              </span>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400 mx-1 hidden sm:block"
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

            <div className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-red-500 mr-1"
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
              <span className="text-xs font-medium text-gray-700">
                {t("dashboardScreens.promotions.to")}
              </span>
              <span className="ml-1 text-xs font-semibold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                {new Date(promotion.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Détails de la promotion */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="bg-purple-100 p-1 rounded-lg mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-600"
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
            </div>
            <h4 className="font-semibold text-sm text-gray-700">
              {t("dashboardScreens.promotions.promotionDetails")}
            </h4>
          </div>

          <div className="space-y-2">
            {discountAction && discountValue !== null && (
              <div className="flex items-center p-2 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                <div className="p-1 rounded-full mr-2 bg-blue-100">
                  {discountAction.actionType === "PERCENT_OFF" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h6"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600"
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
                  )}
                </div>
                <div>
                  <p className="font-semibold text-blue-800 text-sm">
                    {discountValue}
                    {discountAction.actionType === "PERCENT_OFF"
                      ? "%"
                      : "€"}{" "}
                    {t("dashboardScreens.promotions.off")}
                  </p>
                  <p className="text-xs text-blue-600">
                    {discountAction.actionType === "PERCENT_OFF"
                      ? t("dashboardScreens.promotions.percentageDiscount")
                      : t("dashboardScreens.promotions.fixedDiscount")}
                  </p>
                </div>
              </div>
            )}

            {freeItemInfo && (
              <div className="flex items-center p-2 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
                <div className="p-1 rounded-full mr-2 bg-green-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-600"
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
                </div>
                <div>
                  <p className="font-semibold text-green-800 text-sm">
                    {t("dashboardScreens.promotions.freeItem")}
                  </p>
                  <p className="text-xs text-green-600">
                    {freeItemInfo.quantity}x {freeItemInfo.productName}
                  </p>
                </div>
              </div>
            )}

            {!discountAction && !freeItemInfo && (
              <div className="flex items-center bg-gray-100 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500 mr-1"
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
                <p className="text-gray-500 italic text-xs">
                  {t("dashboardScreens.promotions.noDiscounts")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-auto pt-2 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label={t("common.edit")}
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
          <button
            onClick={() => onDelete(promotion.id)}
            className="p-2 rounded-full bg-gray-100 hover:bg-red-50 transition-colors duration-200"
            aria-label={t("common.delete")}
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
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;
