import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ProductService,
  type ProductPayloadEdit,
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
import ConfirmationModal from "../components/ConfirmationModal";
import Sidebar from "../components/SideBar";

interface AdditionalOption {
  id: number;
  name: string;
  unitPrice: number;
}

interface ProductFormData {
  productId: number;
  name: string;
  price: string;
  description: string;
  calories: string;
  categoryId: string;
  includeSizes: boolean;
  smallSizePrice: string;
  mediumSizePrice: string;
  largeSizePrice: string;
  isDisabled: boolean;
}

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [product, setProduct] = useState<ProductFormData>({
    productId: Number(id),
    name: "",
    price: "",
    description: "",
    calories: "",
    categoryId: "",
    includeSizes: false,
    smallSizePrice: "",
    mediumSizePrice: "",
    largeSizePrice: "",
    isDisabled: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [existingOptions, setExistingOptions] = useState<AdditionalOption[]>(
    []
  );
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const showErrorAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleOpenDisableModal = () => {
    setIsDisableModalOpen(true);
  };

  const handleCloseDisableModal = () => {
    setIsDisableModalOpen(false);
  };

  const handleConfirmDisable = async () => {
    await disableProduct();
    setIsDisableModalOpen(false);
  };

  const fetchProductDetails = useCallback(async () => {
    if (!id) {
      showErrorAlert(
        t("dashboardScreens.productDetails.errorLoadingProduct"),
        t("dashboardScreens.productDetails.productIdMissing")
      );
      return;
    }

    try {
      setIsLoadingProduct(true);
      const productData = await ProductService.getProductById(Number(id));
      const url = productData.productPhoto || null;
      setProduct({
        productId: productData.productId,
        name: productData.name,
        price: productData.price != null ? productData.price.toString() : "0",
        description: productData.description || "",
        calories: productData.calories?.toString() || "",
        categoryId: productData.category?.categoryId?.toString() || "",
        includeSizes: productData.includeSizes ?? false,
        smallSizePrice: productData.smallSizePrice?.toString() ?? "0",
        mediumSizePrice: productData.mediumSizePrice?.toString() ?? "0",
        largeSizePrice: productData.largeSizePrice?.toString() ?? "0",
        isDisabled: productData.isDisabled ?? false,
      });
      setCurrentImage(url);
      setSelectedOptionIds(
        productData.additionalOptions?.map((option) => option.id) || []
      );
      setSelectedRequiredOptionIds(
        productData.requiredOptions?.map((option) => option.id) || []
      );
    } catch (error: unknown) {
      showErrorAlert(
        t("dashboardScreens.productDetails.errorLoadingProduct"),
        (error as { message: string }).message ||
          t("dashboardScreens.productDetails.errorLoadingProduct")
      );
    } finally {
      setIsLoadingProduct(false);
    }
  }, [id, t]);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch (error: unknown) {
      showErrorAlert(
        t("dashboardScreens.productDetails.errorLoadingCategories"),
        (error as { message: string }).message ||
          t("dashboardScreens.productDetails.errorLoadingCategories")
      );
      setCategoriesError(
        t("dashboardScreens.productDetails.errorLoadingCategories")
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
    } catch (error: unknown) {
      showErrorAlert(
        t("dashboardScreens.productDetails.errorLoadingOptions"),
        (error as { message: string }).message ||
          t("dashboardScreens.productDetails.errorLoadingOptions")
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
    } catch (error: unknown) {
      showErrorAlert(
        t("dashboardScreens.productDetails.errorLoadingRequiredOptions"),
        (error as { message: string }).message ||
          t("dashboardScreens.productDetails.errorLoadingRequiredOptions")
      );
    } finally {
      setIsLoadingRequiredOptions(false);
    }
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProductDetails();
      await fetchCategories();
      await fetchExistingOptions();
      await fetchExistingRequiredOptions();
    };
    fetchData();
  }, [
    fetchProductDetails,
    fetchCategories,
    fetchExistingOptions,
    fetchExistingRequiredOptions,
  ]);

  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case "name":
        if (!value || (typeof value === "string" && !value.trim())) {
          return t("dashboardScreens.productDetails.productNameRequired");
        }
        return "";
      case "price":
        if (
          !product.includeSizes &&
          (!value || (typeof value === "string" && !value.trim()))
        ) {
          return t("dashboardScreens.productDetails.basePriceRequired");
        }
        if (typeof value === "string" && value && isNaN(parseFloat(value))) {
          return t("dashboardScreens.productDetails.priceInvalid");
        }
        return "";
      case "categoryId":
        if (!value) {
          return t("dashboardScreens.productDetails.categoryRequired");
        }
        return "";
      case "largeSizePrice":
        if (
          product.includeSizes &&
          (!value || (typeof value === "string" && !value.trim()))
        ) {
          return t("dashboardScreens.productDetails.largeSizePriceRequired");
        }
        if (typeof value === "string" && value && isNaN(parseFloat(value))) {
          return t("dashboardScreens.productDetails.priceInvalid");
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
    } catch (error: unknown) {
      showErrorAlert(
        t("dashboardScreens.productDetails.errorLoadingCategories"),
        (error as { message: string }).message ||
          t("dashboardScreens.productDetails.errorLoadingCategories")
      );
      setCategoriesError(
        t("dashboardScreens.productDetails.errorLoadingCategories")
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
      const largeError = validateField(
        "largeSizePrice",
        product.largeSizePrice
      );
      if (largeError) errors.largeSizePrice = largeError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload: ProductPayloadEdit = {
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
        includeSizes: product.includeSizes,
        isDisabled: product.isDisabled,
        image: !newImage && !currentImage,
      };

      if (product.includeSizes) {
        let small = parseFloat(product.smallSizePrice!);
        if (isNaN(small) || product.smallSizePrice === "") small = 0;
        payload.smallSizePrice = small;
        payload.mediumSizePrice = parseFloat(product.mediumSizePrice!);
        payload.largeSizePrice = parseFloat(product.largeSizePrice!);
        payload.price = 0;
      } else {
        payload.price = parseFloat(product.price);
      }

      const formData = new FormData();
      formData.append(
        "productRequest",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      if (newImage) {
        if (newImage.startsWith("data:")) {
          const response = await fetch(newImage);
          const blob = await response.blob();
          formData.append("productPhotoFile", blob, "product-image.jpg");
        } else {
          const response = await fetch(newImage);
          const blob = await response.blob();
          const filename = newImage.split("/").pop() || "product-image.jpg";
          formData.append("productPhotoFile", blob, filename);
        }
      }

      await ProductService.updateProduct(product.productId, formData);

      showErrorAlert(
        t("dashboardScreens.productDetails.successTitle"),
        t("dashboardScreens.productDetails.productUpdated")
      );

      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (error: unknown) {
      showErrorAlert(
        t("dashboardScreens.productDetails.errorUpdatingProduct"),
        (error as { message: string }).message ||
          t("dashboardScreens.productDetails.errorUpdatingProduct")
      );
    } finally {
      setLoading(false);
    }
  };

  const disableProduct = async () => {
    setLoading(true);
    try {
      const payload: ProductPayloadEdit = {
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
        includeSizes: product.includeSizes,
        isDisabled: true,
        image: !newImage && !currentImage,
      };

      if (product.includeSizes) {
        let small = parseFloat(product.smallSizePrice!);
        if (isNaN(small) || product.smallSizePrice === "") small = 0;
        payload.smallSizePrice = small;
        payload.mediumSizePrice = parseFloat(product.mediumSizePrice!);
        payload.largeSizePrice = parseFloat(product.largeSizePrice!);
        payload.price = 0;
      } else {
        payload.price = parseFloat(product.price);
      }

      const formData = new FormData();
      formData.append(
        "productRequest",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      if (newImage) {
        if (newImage.startsWith("data:")) {
          const response = await fetch(newImage);
          const blob = await response.blob();
          formData.append("productPhotoFile", blob, "product-image.jpg");
        } else {
          const response = await fetch(newImage);
          const blob = await response.blob();
          const filename = newImage.split("/").pop() || "product-image.jpg";
          formData.append("productPhotoFile", blob, filename);
        }
      }

      await ProductService.updateProduct(product.productId, formData);

      setProduct({ ...product, isDisabled: true });

      showErrorAlert(
        t("dashboardScreens.productDetails.disableSuccessTitle"),
        t("dashboardScreens.productDetails.disableSuccessMessage")
      );

      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (error: unknown) {
      showErrorAlert(
        t("dashboardScreens.productDetails.disableErrorTitle"),
        (error as { message: string }).message ||
          t("dashboardScreens.productDetails.disableErrorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
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
                  {t("dashboardScreens.productDetails.editProduct")}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
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
                  {t("dashboardScreens.productDetails.editProduct")}
                </h1>
                <div className="w-10"></div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.productDetails.productName")}
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    fieldErrors.name ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  placeholder={t(
                    "dashboardScreens.productDetails.productNamePlaceholder"
                  )}
                  disabled={loading}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600 animate-pulse">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="mb-6 animate-fade-in">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("dashboardScreens.productDetails.disabledProduct")}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("dashboardScreens.productDetails.disabledHelpText")}
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={product.isDisabled}
                      onChange={(e) => onChange("isDisabled", e.target.checked)}
                      className="sr-only"
                      id="isDisabledToggle"
                      disabled={loading}
                    />
                    <label
                      htmlFor="isDisabledToggle"
                      className={`block w-12 h-6 rounded-full transition-all duration-300 ${
                        product.isDisabled ? "bg-red-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 transform ${
                          product.isDisabled ? "translate-x-6" : ""
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6 animate-fade-in">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("dashboardScreens.productDetails.includeSizes")}
                  </label>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={product.includeSizes}
                      onChange={(e) =>
                        onChange("includeSizes", e.target.checked)
                      }
                      className="sr-only"
                      id="includeSizes"
                      disabled={loading}
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

              {product.includeSizes ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.productDetails.smallSizePrice")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        €
                      </span>
                      <input
                        type="text"
                        value={product.smallSizePrice}
                        onChange={(e) =>
                          handleFieldChange(
                            "smallSizePrice",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.productDetails.mediumSizePrice")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        €
                      </span>
                      <input
                        type="text"
                        value={product.mediumSizePrice}
                        onChange={(e) =>
                          handleFieldChange(
                            "mediumSizePrice",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.productDetails.largeSizePrice")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        €
                      </span>
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
                        disabled={loading}
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
                    {t("dashboardScreens.productDetails.price")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      €
                    </span>
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
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.price && (
                    <p className="mt-1 text-sm text-red-600 animate-pulse">
                      {fieldErrors.price}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.productDetails.category")}
                </label>
                <div
                  className={`relative rounded-lg border ${
                    fieldErrors.categoryId
                      ? "border-red-500"
                      : "border-gray-300"
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
                      {t("dashboardScreens.productDetails.selectCategory")}
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
                    {t(
                      "dashboardScreens.productDetails.retryLoadingCategories"
                    )}
                  </button>
                )}
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.productDetails.additionalOptions")}
                </label>
                {isLoadingOptions ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : existingOptions.length === 0 ? (
                  <p className="text-gray-500 italic py-2">
                    {t("dashboardScreens.productDetails.noOptionsAvailable")}
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
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.productDetails.requiredOptions")}
                </label>
                {isLoadingRequiredOptions ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : existingRequiredOptions.length === 0 ? (
                  <p className="text-gray-500 italic py-2">
                    {t(
                      "dashboardScreens.productDetails.noRequiredOptionsAvailable"
                    )}
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    <div className="grid grid-cols-1 gap-2">
                      {existingRequiredOptions.map((option) => (
                        <div
                          key={option.id}
                          onClick={() =>
                            toggleRequiredOptionSelection(option.id)
                          }
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
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.productDetails.description")}
                </label>
                <textarea
                  value={product.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder={t(
                    "dashboardScreens.productDetails.descriptionPlaceholder"
                  )}
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.productDetails.calories")}
                </label>
                <input
                  type="text"
                  value={product.calories}
                  onChange={(e) =>
                    onChange("calories", e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder={t(
                    "dashboardScreens.productDetails.caloriesPlaceholder"
                  )}
                  disabled={loading}
                />
              </div>

              <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dashboardScreens.productDetails.updateImage")}
                </label>
                <ImageUploader
                  initialImage={currentImage}
                  onImageSelected={(uri) => {
                    setNewImage(uri);
                  }}
                  removable
                  onRemoveImage={() => {
                    setNewImage(null);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleSaveChanges}
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
                      {t("dashboardScreens.productDetails.save")}
                    </div>
                  ) : (
                    t("dashboardScreens.productDetails.saveChanges")
                  )}
                </button>

                <button
                  onClick={handleOpenDisableModal}
                  disabled={loading || product.isDisabled}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                    loading || product.isDisabled
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {t("dashboardScreens.productDetails.deleteProduct")}
                </button>
              </div>
            </div>
          </div>
        </main>

        <ConfirmationModal
          isOpen={isDisableModalOpen}
          onClose={handleCloseDisableModal}
          onConfirm={handleConfirmDisable}
          title={t("dashboardScreens.productDetails.disableProductTitle")}
          message={t("dashboardScreens.productDetails.disableProductMessage")}
          confirmText={t("dashboardScreens.productDetails.disableConfirm")}
          cancelText={t("common.cancel")}
          isLoading={loading}
        />

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

export default EditProduct;
