import React, { useState, useEffect, useCallback } from "react";
import {
  ProductService,
  type ProductPayload,
} from "../services/productService";
import { CategoryService } from "../services/categoryService";
import { type Category } from "../services/categoryService";
import { getAllAdditionalOptions } from "../services/additionalOptionsService";
import {
  getAllRequiredOptions,
  type requiredOptionResponse,
} from "../services/requiredOptionsService";
import { useTranslation } from "react-i18next";
import ImageUploader from "../components/ImageUploader";
import AnimatedAlert from "../components/AnimatedAlert";

interface AdditionalOption {
  id: number;
  name: string;
  unitPrice: number;
}

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  calories: string;
  categoryId: string;
  includeSizes: boolean;
  smallSizePrice: string;
  mediumSizePrice: string;
  largeSizePrice: string;
}

const CreateProduct: React.FC = () => {
  const { t } = useTranslation();
  const [product, setProduct] = useState<ProductFormData>({
    name: "",
    price: "",
    description: "",
    calories: "",
    categoryId: "",
    includeSizes: false,
    smallSizePrice: "",
    mediumSizePrice: "",
    largeSizePrice: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [existingOptions, setExistingOptions] = useState<AdditionalOption[]>(
    []
  );
  const [enableAdditionalOptions, setEnableAdditionalOptions] = useState(false);
  const [enableRequiredOptions, setEnableRequiredOptions] = useState(false);
  const [existingRequiredOptions, setExistingRequiredOptions] = useState<
    requiredOptionResponse[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingRequiredOptions, setIsLoadingRequiredOptions] =
    useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [selectedRequiredOptionIds, setSelectedRequiredOptionIds] = useState<
    number[]
  >([]);
  const [showAlert, setshowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const ShowAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setshowAlert(true);
  };

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch {
      ShowAlert(
        t("dashboardScreens.createProduct.errors.categoriesLoadError"),
        t("dashboardScreens.createProduct.errors.categoriesLoadMessage")
      );
      setCategoriesError(
        t("dashboardScreens.createProduct.errors.categoriesLoadError")
      );
    } finally {
      setIsLoadingCategories(false);
    }
  }, [t]);

  const fetchExistingOptions = useCallback(async () => {
    try {
      setIsLoadingOptions(true);
      const response = await getAllAdditionalOptions(0, 100);
      const options = response.content || [];
      setExistingOptions(
        options
          .filter(
            (option) =>
              option.name !== undefined && option.unitPrice !== undefined
          )
          .map((option) => ({
            ...option,
            id: Number(option.id),
            name: option.name as string,
            unitPrice: option.unitPrice as number,
          }))
      );
    } catch {
      ShowAlert(
        t("dashboardScreens.createProduct.errors.optionsLoadError"),
        t("dashboardScreens.createProduct.errors.optionsLoadMessage")
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }, [t]);

  const fetchExistingRequiredOptions = useCallback(async () => {
    try {
      setIsLoadingRequiredOptions(true);
      const response = await getAllRequiredOptions(0, 100);
      const options = response.content || [];
      setExistingRequiredOptions(
        options
          .filter((option) => option.name !== undefined)
          .map((option) => ({
            ...option,
            id: Number(option.id),
            name: option.name as string,
          }))
      );
    } catch {
      ShowAlert(
        t("dashboardScreens.createProduct.errors.requiredOptionsError"),
        t("dashboardScreens.createProduct.errors.requiredOptionsMessage")
      );
    } finally {
      setIsLoadingRequiredOptions(false);
    }
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCategories();
      await fetchExistingOptions();
      await fetchExistingRequiredOptions();
    };
    fetchData();
  }, [fetchCategories, fetchExistingOptions, fetchExistingRequiredOptions]);

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case "name":
        if (!value || (typeof value === "string" && !value.trim())) {
          return t(
            "dashboardScreens.createProduct.validationErrors.nameRequired"
          );
        }
        return "";
      case "price":
        if (
          !product.includeSizes &&
          (!value || (typeof value === "string" && !value.trim()))
        ) {
          return t(
            "dashboardScreens.createProduct.validationErrors.priceRequired"
          );
        }
        if (typeof value === "string" && value && isNaN(parseFloat(value))) {
          return t(
            "dashboardScreens.createProduct.validationErrors.priceInvalid"
          );
        }
        return "";
      case "categoryId":
        if (!value) {
          return t(
            "dashboardScreens.createProduct.validationErrors.categoryRequired"
          );
        }
        return "";
      case "smallSizePrice":
      case "mediumSizePrice":
      case "largeSizePrice":
        if (
          product.includeSizes &&
          (!value || (typeof value === "string" && !value.trim()))
        ) {
          return t(
            "dashboardScreens.createProduct.validationErrors.sizePriceRequired"
          );
        }
        if (typeof value === "string" && value && isNaN(parseFloat(value))) {
          return t(
            "dashboardScreens.createProduct.validationErrors.priceInvalid"
          );
        }
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setProduct((prev) => ({ ...prev, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const onChange = (key: string, value: string | boolean) => {
    handleFieldChange(key, value);
  };

  const retryLoadingCategories = async () => {
    setCategoriesError(null);
    setIsLoadingCategories(true);
    try {
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch {
      ShowAlert(
        t("dashboardScreens.createProduct.errors.retryError"),
        t("dashboardScreens.createProduct.errors.retryMessage")
      );
      setCategoriesError(
        t("dashboardScreens.createProduct.errors.categoriesLoadError")
      );
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const toggleOptionSelection = (optionId: number) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const toggleRequiredOptionSelection = (optionId: number) => {
    setSelectedRequiredOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const nameError = validateField("name", product.name);
    if (nameError) errors.name = nameError;

    const categoryError = validateField("categoryId", product.categoryId);
    if (categoryError) errors.categoryId = categoryError;

    if (!product.includeSizes) {
      const priceError = validateField("price", product.price);
      if (priceError) errors.price = priceError;
    } else {
      const smallError = validateField(
        "smallSizePrice",
        product.smallSizePrice
      );
      if (smallError) errors.smallSizePrice = smallError;

      const mediumError = validateField(
        "mediumSizePrice",
        product.mediumSizePrice
      );
      if (mediumError) errors.mediumSizePrice = mediumError;

      const largeError = validateField(
        "largeSizePrice",
        product.largeSizePrice
      );
      if (largeError) errors.largeSizePrice = largeError;
    }

    if (enableAdditionalOptions && selectedOptionIds.length === 0) {
      errors.additionalOptions = t(
        "dashboardScreens.createProduct.validationErrors.selectAtLeastOneAdditional"
      );
    }

    if (enableRequiredOptions && selectedRequiredOptionIds.length === 0) {
      errors.requiredOptions = t(
        "dashboardScreens.createProduct.validationErrors.selectAtLeastOneRequired"
      );
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload: ProductPayload = {
        name: product.name.trim(),
        description: product.description.trim() || undefined,
        calories: product.calories ? parseInt(product.calories, 10) : undefined,
        categoryId: parseInt(product.categoryId, 10),
        additionalOptionIds:
          selectedOptionIds.length > 0 ? selectedOptionIds : undefined,
        requiredOptionIds:
          selectedRequiredOptionIds.length > 0
            ? selectedRequiredOptionIds
            : undefined,
        selectedSize: "NORMAL",
      };

      if (product.includeSizes) {
        payload.includeSizes = true;
        payload.smallSizePrice = parseFloat(product.smallSizePrice);
        payload.mediumSizePrice = parseFloat(product.mediumSizePrice);
        payload.largeSizePrice = parseFloat(product.largeSizePrice);
      } else {
        payload.includeSizes = false;
        payload.price = parseFloat(product.price);
      }

      const formData = new FormData();

      // CORRECT WAY: Append as Blob like mobile version
      formData.append(
        "productRequest",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      if (imageUri) {
        // Convert data URI to Blob if needed
        if (imageUri.startsWith("data:")) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append("productPhotoFile", blob, "product-image.jpg");
        } else {
          // For file URIs
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const filename = imageUri.split("/").pop() || "product-image.jpg";
          formData.append("productPhotoFile", blob, filename);
        }
      }

      await ProductService.createProduct(formData);
      ShowAlert(
        t("dashboardScreens.createProduct.success.title"),
        t("dashboardScreens.createProduct.success.message")
      );
    } catch (error: unknown) {
      ShowAlert(
        t("dashboardScreens.createProduct.errors.saveError"),
        (error as Error).message ||
          t("dashboardScreens.createProduct.errors.saveMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-center">
              {t("dashboardScreens.createProduct.title")}
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
          {/* Product Name */}
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("dashboardScreens.createProduct.productName")} *
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                fieldErrors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
              placeholder={t("dashboardScreens.createProduct.productName")}
              disabled={loading}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600 animate-pulse">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Include Sizes Toggle */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">
                {t("dashboardScreens.createProduct.includeSizes")}
              </label>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={product.includeSizes}
                  onChange={(e) => onChange("includeSizes", e.target.checked)}
                  className="sr-only"
                  id="includeSizes"
                />
                <label
                  htmlFor="includeSizes"
                  className={`block w-12 h-6 rounded-full transition-all duration-300 ${
                    product.includeSizes ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 transform ${
                      product.includeSizes ? "translate-x-6" : ""
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>

          {/* Price or Size Prices */}
          {product.includeSizes ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.createProduct.smallSizePrice")} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">€</span>
                  <input
                    type="text"
                    value={product.smallSizePrice}
                    onChange={(e) =>
                      handleFieldChange(
                        "smallSizePrice",
                        e.target.value.replace(/[^0-9.]/g, "")
                      )
                    }
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                      fieldErrors.smallSizePrice
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.smallSizePrice && (
                  <p className="mt-1 text-sm text-red-600 animate-pulse">
                    {fieldErrors.smallSizePrice}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.createProduct.mediumSizePrice")} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">€</span>
                  <input
                    type="text"
                    value={product.mediumSizePrice}
                    onChange={(e) =>
                      handleFieldChange(
                        "mediumSizePrice",
                        e.target.value.replace(/[^0-9.]/g, "")
                      )
                    }
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                      fieldErrors.mediumSizePrice
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.mediumSizePrice && (
                  <p className="mt-1 text-sm text-red-600 animate-pulse">
                    {fieldErrors.mediumSizePrice}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.createProduct.largeSizePrice")} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">€</span>
                  <input
                    type="text"
                    value={product.largeSizePrice}
                    onChange={(e) =>
                      handleFieldChange(
                        "largeSizePrice",
                        e.target.value.replace(/[^0-9.]/g, "")
                      )
                    }
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                      fieldErrors.largeSizePrice
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.largeSizePrice && (
                  <p className="mt-1 text-sm text-red-600 animate-pulse">
                    {fieldErrors.largeSizePrice}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboardScreens.createProduct.price")} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">€</span>
                <input
                  type="text"
                  value={product.price}
                  onChange={(e) =>
                    handleFieldChange(
                      "price",
                      e.target.value.replace(/[^0-9.]/g, "")
                    )
                  }
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                    fieldErrors.price ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  placeholder="0.00"
                />
              </div>
              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">
                  {fieldErrors.price}
                </p>
              )}
            </div>
          )}

          {/* Category */}
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("dashboardScreens.createProduct.category")} *
            </label>
            <div
              className={`relative rounded-lg border ${
                fieldErrors.categoryId ? "border-red-500" : "border-gray-300"
              } focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all duration-200`}
            >
              <select
                value={product.categoryId}
                onChange={(e) =>
                  handleFieldChange("categoryId", e.target.value)
                }
                disabled={loading || isLoadingCategories}
                className="w-full px-4 py-3 bg-transparent appearance-none outline-none"
                size={categories.length > 5 ? 5 : categories.length + 1}
                style={{
                  overflowY: categories.length > 5 ? "auto" : "visible",
                  maxHeight: "150px",
                }}
              >
                <option value="">
                  {t("dashboardScreens.createProduct.selectCategory")}
                </option>
                {categories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={category.categoryId?.toString()}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            {fieldErrors.categoryId && (
              <p className="mt-1 text-sm text-red-600 animate-pulse">
                {fieldErrors.categoryId}
              </p>
            )}
            {categoriesError && (
              <button
                onClick={retryLoadingCategories}
                className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 text-sm"
              >
                {t("dashboardScreens.createProduct.retryLoadingCategories")}
              </button>
            )}
          </div>

          {/* Additional Options Toggle */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">
                {t("dashboardScreens.createProduct.enableAdditionalOptions")}
              </label>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={enableAdditionalOptions}
                  onChange={(e) => setEnableAdditionalOptions(e.target.checked)}
                  className="sr-only"
                  id="additionalOptionsToggle"
                />
                <label
                  htmlFor="additionalOptionsToggle"
                  className={`block w-12 h-6 rounded-full transition-all duration-300 ${
                    enableAdditionalOptions ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 transform ${
                      enableAdditionalOptions ? "translate-x-6" : ""
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>

          {/* Existing Additional Options */}
          {enableAdditionalOptions && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboardScreens.createProduct.additionalOptions")}
              </label>
              {isLoadingOptions ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : existingOptions.length === 0 ? (
                <p className="text-gray-500 italic py-2">
                  {t("dashboardScreens.createProduct.noOptionsAvailable")}
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  <div className="grid grid-cols-1 gap-2">
                    {existingOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => toggleOptionSelection(option.id)}
                        className={`p-3 rounded-md cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                          selectedOptionIds.includes(option.id)
                            ? "bg-indigo-100 border-indigo-500 border"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{option.name}</p>
                            <p className="text-sm text-gray-600">
                              €{option.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          {selectedOptionIds.includes(option.id) && (
                            <svg
                              className="w-5 h-5 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {fieldErrors.additionalOptions && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">
                  {fieldErrors.additionalOptions}
                </p>
              )}
            </div>
          )}

          {/* Required Options Toggle */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">
                {t("dashboardScreens.createProduct.enableRequiredOptions")}
              </label>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={enableRequiredOptions}
                  onChange={(e) => setEnableRequiredOptions(e.target.checked)}
                  className="sr-only"
                  id="requiredOptionsToggle"
                />
                <label
                  htmlFor="requiredOptionsToggle"
                  className={`block w-12 h-6 rounded-full transition-all duration-300 ${
                    enableRequiredOptions ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 transform ${
                      enableRequiredOptions ? "translate-x-6" : ""
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>

          {/* Existing Required Options */}
          {enableRequiredOptions && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboardScreens.createProduct.requiredOptions")}
              </label>
              {isLoadingRequiredOptions ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : existingRequiredOptions.length === 0 ? (
                <p className="text-gray-500 italic py-2">
                  {t(
                    "dashboardScreens.createProduct.noRequiredOptionsAvailable"
                  )}
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  <div className="grid grid-cols-1 gap-2">
                    {existingRequiredOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => toggleRequiredOptionSelection(option.id)}
                        className={`p-3 rounded-md cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                          selectedRequiredOptionIds.includes(option.id)
                            ? "bg-indigo-100 border-indigo-500 border"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{option.name}</p>
                          {selectedRequiredOptionIds.includes(option.id) && (
                            <svg
                              className="w-5 h-5 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {fieldErrors.requiredOptions && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">
                  {fieldErrors.requiredOptions}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("dashboardScreens.createProduct.description")}
            </label>
            <textarea
              value={product.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder={t(
                "dashboardScreens.createProduct.descriptionPlaceholder"
              )}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Calories */}
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("dashboardScreens.createProduct.calories")}
            </label>
            <input
              type="text"
              value={product.calories}
              onChange={(e) =>
                onChange("calories", e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder={t(
                "dashboardScreens.createProduct.caloriesPlaceholder"
              )}
              disabled={loading}
            />
          </div>

          {/* Product Image */}
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("dashboardScreens.createProduct.productImage")}
            </label>
            <ImageUploader
              onImageSelected={setImageUri}
              onRemoveImage={() => setImageUri(null)}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t("dashboardScreens.createProduct.saving")}
              </div>
            ) : (
              t("dashboardScreens.createProduct.saveProduct")
            )}
          </button>
        </div>
      </div>

      <AnimatedAlert
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setshowAlert(false)}
      />
    </div>
  );
};

export default CreateProduct;
