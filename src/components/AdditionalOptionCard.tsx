import React from "react";
import { useNavigate } from "react-router-dom";
import { type AdditionalOptionResponse } from "../services/additionalOptionsService";
import { useTranslation } from "react-i18next";

interface AdditionalOptionCardProps {
  option: AdditionalOptionResponse;
  onDelete: (id: number) => void;
}

const AdditionalOptionCard: React.FC<AdditionalOptionCardProps> = ({
  option,
  onDelete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/additional-option-form/${option.id}`);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-4 transition-all hover:shadow-lg ${
        option.isDisabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3
              className={`text-lg font-semibold ${
                option.isDisabled ? "text-gray-500" : "text-gray-800"
              }`}
            >
              {option.name}
            </h3>
            {option.isDisabled && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                {t("dashboardScreens.additionalOptionsList.disabled")}
              </span>
            )}
          </div>
          <p
            className={`text-sm ${
              option.isDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {option.unitPrice?.toFixed(2)} €
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={t("common.edit")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
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

          {!option.isDisabled && (
            <button
              onClick={() => onDelete(option.id)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              title={t("common.delete")}
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
          )}
        </div>
      </div>

      {option.categoryName && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {option.categoryName}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdditionalOptionCard;
