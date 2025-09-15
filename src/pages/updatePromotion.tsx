/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  PromotionService,
  type Action,
  type Rule,
} from "../services/promotionService";
import { ProductService } from "../services/productService";
import { type Category, CategoryService } from "../services/categoryService";
import ImageUploader from "../components/ImageUploader";
import AnimatedAlert from "../components/AnimatedAlert";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiTrash2, FiX, FiChevronDown } from "react-icons/fi";
import Sidebar from "../components/SideBar";

interface PromotionFormData {
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  ruleActionPairs: {
    rule: {
      ruleType: "PRODUCT" | "CART_VALUE" | "CATEGORY";
      ruleValue: any;
    };
    action: {
      actionType: "PERCENT_OFF" | "FIXED_OFF" | "FREE_ITEM";
      actionValue: any;
    };
  }[];
}

const UpdatePromotion: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const id = params?.id as string;
  const promotionPhoto = params?.promotionPhoto as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PromotionFormData>({
    name: "",
    code: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    ruleActionPairs: [],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ruleTypes, setRuleTypes] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(
    promotionPhoto || null
  );
  const [newImage, setNewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [newRule, setNewRule] = useState({
    ruleType: "PRODUCT" as "PRODUCT" | "CART_VALUE" | "CATEGORY",
    productId: "",
    minCartValue: "",
    categoryValue: [] as string[],
  });

  const [newAction, setNewAction] = useState({
    actionType: "FIXED_OFF" as "FIXED_OFF" | "PERCENT_OFF" | "FREE_ITEM",
    amount: "",
    percentage: "",
    quantity: "",
    productId: "",
  });

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [types, productsResponse, categoriesResponse, promotionData] =
          await Promise.all([
            PromotionService.getRuleTypes(),
            ProductService.getAllProducts(0, 100),
            CategoryService.getCategories(),
            PromotionService.getPromotionById(Number(id)),
          ]);

        setRuleTypes(types);
        setProducts(productsResponse.content);
        setCategories(categoriesResponse);
        setCurrentImage(promotionData.photoBase64 || null);

        // Convert the promotion data to our new structure
        const ruleActionPairs = promotionData.rules.map(
          (rule: Rule, index: number) => ({
            rule,
            action: promotionData.actions[index],
          })
        );

        setFormData({
          name: promotionData.name,
          code: promotionData.code,
          startDate: new Date(promotionData.startDate),
          endDate: new Date(promotionData.endDate),
          isActive: promotionData.isActive,
          ruleActionPairs,
        });
      } catch {
        showAlert(
          t("dashboardScreens.createPromotion.errorTitle"),
          t("dashboardScreens.createPromotion.loadingError")
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, t]);

  const addRuleActionPair = () => {
    if (!newRule.ruleType) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.selectWhereDiscountApplies")
      );
      return;
    }

    if (!newAction.actionType) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.selectDiscountType")
      );
      return;
    }

    let ruleValue = {};
    let ruleKey = "";

    switch (newRule.ruleType) {
      case "PRODUCT":
        if (!newRule.productId) {
          showAlert(
            t("dashboardScreens.createPromotion.errorTitle"),
            t("dashboardScreens.createPromotion.selectProduct")
          );
          return;
        }
        ruleValue = { productId: newRule.productId };
        ruleKey = `PRODUCT_${newRule.productId}`;
        break;

      case "CATEGORY": {
        if (newRule.categoryValue.length === 0) {
          showAlert(
            t("dashboardScreens.createPromotion.errorTitle"),
            t("dashboardScreens.createPromotion.selectCategory")
          );
          return;
        }
        const categoryValue =
          newRule.categoryValue.length === 1
            ? newRule.categoryValue[0]
            : [...newRule.categoryValue].sort().join(",");
        ruleValue = {
          value:
            newRule.categoryValue.length === 1
              ? newRule.categoryValue[0]
              : newRule.categoryValue,
        };
        ruleKey = `CATEGORY_${categoryValue}`;
        break;
      }

      case "CART_VALUE":
        if (!newRule.minCartValue) {
          showAlert(
            t("dashboardScreens.createPromotion.errorTitle"),
            t("dashboardScreens.createPromotion.enterMinCartValue")
          );
          return;
        }
        ruleValue = { minimumCartValue: parseFloat(newRule.minCartValue) };
        ruleKey = `CART_VALUE_${newRule.minCartValue}`;
        break;

      default:
        showAlert(
          t("dashboardScreens.createPromotion.errorTitle"),
          t("dashboardScreens.createPromotion.invalidChoice")
        );
        return;
    }

    // Check for duplicate rules
    const ruleExists = formData.ruleActionPairs.some((pair) => {
      const existingRuleKey = generateRuleKey(pair.rule);
      return existingRuleKey === ruleKey;
    });

    if (ruleExists) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.duplicateCondition")
      );
      return;
    }

    // Validate action based on action type
    let actionValue = {};
    switch (newAction.actionType) {
      case "FIXED_OFF":
        if (!newAction.amount) {
          showAlert(
            t("dashboardScreens.createPromotion.errorTitle"),
            t("dashboardScreens.createPromotion.enterAmount")
          );
          return;
        }
        actionValue = { amount: parseFloat(newAction.amount) };
        break;
      case "PERCENT_OFF": {
        const percentage = parseFloat(newAction.percentage);
        if (!newAction.percentage || isNaN(percentage)) {
          showAlert(
            t("dashboardScreens.createPromotion.errorTitle"),
            t("dashboardScreens.createPromotion.enterValidPercentage")
          );
          return;
        }
        if (percentage <= 0 || percentage >= 100) {
          showAlert(
            t("dashboardScreens.createPromotion.errorTitle"),
            t("dashboardScreens.createPromotion.percentageRange")
          );
          return;
        }
        actionValue = { percentage: percentage };
        break;
      }
      case "FREE_ITEM":
        if (!newAction.quantity || !newAction.productId) {
          showAlert(
            t("dashboardScreens.createPromotion.errorTitle"),
            t("dashboardScreens.createPromotion.enterQtyAndProduct")
          );
          return;
        }
        actionValue = {
          quantity: parseInt(newAction.quantity),
          productId: newAction.productId,
        };
        break;
      default:
        showAlert(
          t("dashboardScreens.createPromotion.errorTitle"),
          t("dashboardScreens.createPromotion.invalidActionType")
        );
        return;
    }

    // Check for invalid combinations
    if (
      newRule.ruleType === "CATEGORY" &&
      newAction.actionType === "FREE_ITEM"
    ) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.freeItemWithCategory")
      );
      return;
    }

    // Create the new pair
    const newPair = {
      rule: {
        ruleType: newRule.ruleType,
        ruleValue,
      },
      action: {
        actionType: newAction.actionType,
        actionValue,
      },
    };

    setFormData({
      ...formData,
      ruleActionPairs: [...formData.ruleActionPairs, newPair],
    });

    // Reset forms
    setNewRule({
      ruleType: "PRODUCT",
      productId: "",
      minCartValue: "",
      categoryValue: [],
    });
    setNewAction({
      actionType: "FIXED_OFF",
      amount: "",
      percentage: "",
      quantity: "",
      productId: "",
    });
  };

  const generateRuleKey = (rule: Rule) => {
    switch (rule.ruleType) {
      case "PRODUCT":
        return `PRODUCT_${rule.ruleValue.productId}`;
      case "CATEGORY": {
        const categoryValue = Array.isArray(rule.ruleValue.value)
          ? [...rule.ruleValue.value].sort().join(",")
          : rule.ruleValue.value;
        return `CATEGORY_${categoryValue}`;
      }
      case "CART_VALUE":
        return `CART_VALUE_${rule.ruleValue.minimumCartValue}`;
      default:
        return "";
    }
  };

  const getProductNameById = (productId: number) => {
    const product = products.find((p) => p.productId === productId);
    return product ? product.name : productId;
  };

  const getDisplayValue = (rule: Rule) => {
    const ruleValue = rule.ruleValue;

    if (typeof ruleValue === "string") {
      return ruleValue;
    }

    switch (rule.ruleType) {
      case "PRODUCT": {
        const productName = getProductNameById(Number(ruleValue.productId));
        return productName;
      }
      case "CATEGORY":
        return Array.isArray(ruleValue?.value)
          ? ruleValue.value.join(", ")
          : ruleValue?.value ?? "-";
      case "CART_VALUE":
        return ruleValue?.minimumCartValue ?? "-";
      default:
        return "-";
    }
  };

  const getActionDisplayValue = (action: Action) => {
    const { actionType, actionValue } = action;

    switch (actionType) {
      case "FIXED_OFF":
        return `€${actionValue.amount}`;

      case "PERCENT_OFF":
        return `${actionValue.percentage}%`;

      case "FREE_ITEM": {
        const productName = getProductNameById(Number(actionValue.productId));
        return `${productName} (Quantity: ${actionValue.quantity})`;
      }

      default:
        return JSON.stringify(actionValue);
    }
  };

  const removeRuleActionPair = (index: number) => {
    const newPairs = [...formData.ruleActionPairs];
    newPairs.splice(index, 1);
    setFormData({ ...formData, ruleActionPairs: newPairs });
  };

  const handleEditPair = (index: number) => {
    const pair = formData.ruleActionPairs[index];

    // Set the rule form
    setNewRule({
      ruleType: pair.rule.ruleType,
      productId:
        pair.rule.ruleType === "PRODUCT" ? pair.rule.ruleValue.productId : "",
      minCartValue:
        pair.rule.ruleType === "CART_VALUE"
          ? String(pair.rule.ruleValue.minimumCartValue)
          : "",
      categoryValue:
        pair.rule.ruleType === "CATEGORY"
          ? Array.isArray(pair.rule.ruleValue.value)
            ? pair.rule.ruleValue.value
            : [pair.rule.ruleValue.value]
          : [],
    });

    // Set the action form
    setNewAction({
      actionType: pair.action.actionType,
      amount:
        pair.action.actionType === "FIXED_OFF"
          ? String(pair.action.actionValue.amount)
          : "",
      percentage:
        pair.action.actionType === "PERCENT_OFF"
          ? String(pair.action.actionValue.percentage)
          : "",
      quantity:
        pair.action.actionType === "FREE_ITEM"
          ? String(pair.action.actionValue.quantity)
          : "",
      productId:
        pair.action.actionType === "FREE_ITEM"
          ? String(pair.action.actionValue.productId)
          : "",
    });

    // Remove the pair being edited
    removeRuleActionPair(index);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.requiredFields")
      );
      return;
    }

    if (formData.ruleActionPairs.length === 0) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.atLeastOnePair")
      );
      return;
    }

    if (formData.startDate >= formData.endDate) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.endDateAfterStart")
      );
      return;
    }

    // Check for invalid combinations
    const hasInvalidCombination = formData.ruleActionPairs.some(
      (pair) =>
        pair.rule.ruleType === "CATEGORY" &&
        pair.action.actionType === "FREE_ITEM"
    );

    if (hasInvalidCombination) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        t("dashboardScreens.createPromotion.invalidCombination")
      );
      return;
    }
    const formPayload = new FormData();

    // Convert our pair structure back to separate rules and actions arrays for the API
    const rules = formData.ruleActionPairs.map((pair) => pair.rule);
    const actions = formData.ruleActionPairs.map((pair) => pair.action);

    // CORRECT WAY: Use Blob like product version
    const promotionRequest = {
      name: formData.name,
      code: formData.code,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      isActive: formData.isActive,
      rules,
      actions,
      promotionPhoto: !newImage && !currentImage,
    };

    formPayload.append(
      "promotionRequest",
      new Blob([JSON.stringify(promotionRequest)], { type: "application/json" })
    );

    if (newImage) {
      // Convert data URL to blob
      let blob: Blob;
      if (newImage.startsWith("data:")) {
        const response = await fetch(newImage);
        blob = await response.blob();
      } else {
        const response = await fetch(newImage);
        blob = await response.blob();
      }
      formPayload.append("promotionPhotoFile", blob, "promotion.jpg");
    }

    try {
      setLoading(true);
      await PromotionService.updatePromotion(parseInt(id), formPayload);
      showAlert(
        t("dashboardScreens.createPromotion.successTitle"),
        t("dashboardScreens.createPromotion.promotionUpdated")
      );
      setTimeout(() => navigate(-1), 1500);
    } catch (error: any) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        error.message ||
          t("dashboardScreens.createPromotion.promotionUpdateFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && formData.name === "") {
    return (
      <div className="min-h-screen bg-gray-50 flex-1">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
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
                  {t("dashboardScreens.createPromotion.updatePromotionTitle")}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <AnimatedAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />

          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center mb-6">
                <h1 className="text-2xl font-bold mx-auto">
                  {t("dashboardScreens.createPromotion.updatePromotionTitle")}
                </h1>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-700">
                  {t("dashboardScreens.createPromotion.basicInfo")}
                </h2>

                <input
                  placeholder={t(
                    "dashboardScreens.createPromotion.namePlaceholder"
                  )}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <input
                  placeholder={t(
                    "dashboardScreens.createPromotion.codePlaceholder"
                  )}
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </motion.div>

              {/* Dates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-700">
                  {t("dashboardScreens.createPromotion.datesLabel")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboardScreens.createPromotion.fromLabel")}
                    </label>
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date: Date | null) =>
                        setFormData({
                          ...formData,
                          startDate: date ?? formData.startDate,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboardScreens.createPromotion.toLabel")}
                    </label>
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date: Date | null) =>
                        setFormData({
                          ...formData,
                          endDate: date ?? formData.endDate,
                        })
                      }
                      minDate={formData.startDate}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700 font-medium">
                  {t("dashboardScreens.createPromotion.activeLabel")}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </motion.div>

              {/* Conditions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-700">
                  {t("dashboardScreens.createPromotion.conditionsLabel")}
                </h2>

                <AnimatePresence>
                  {formData.ruleActionPairs.map((pair, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-medium">
                          {pair.rule.ruleType}: {getDisplayValue(pair.rule)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pair.action.actionType}:{" "}
                          {getActionDisplayValue(pair.action)}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditPair(index)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => removeRuleActionPair(index)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Add New Condition */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="p-6 bg-gray-50 rounded-xl space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  {t("dashboardScreens.createPromotion.addNewCondition")}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.createPromotion.applyLabel")}
                    </label>
                    <select
                      value={newRule.ruleType}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          ruleType: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">
                        {t("dashboardScreens.createPromotion.chooseCondition")}
                      </option>
                      {ruleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newRule.ruleType === "PRODUCT" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("dashboardScreens.createPromotion.selectProduct")}
                      </label>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowProductPicker(!showProductPicker)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg flex justify-between items-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <span>
                            {newRule.productId
                              ? products.find(
                                  (p) => p.productId === newRule.productId
                                )?.name
                              : t(
                                  "dashboardScreens.createPromotion.selectProductPlaceholder"
                                )}
                          </span>
                          <FiChevronDown />
                        </button>

                        {showProductPicker && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                              <span className="font-medium">
                                {t(
                                  "dashboardScreens.createPromotion.selectProduct"
                                )}
                              </span>
                              <button
                                onClick={() => setShowProductPicker(false)}
                              >
                                <FiX />
                              </button>
                            </div>
                            {products.map((product) => (
                              <div
                                key={product.productId}
                                onClick={() => {
                                  setNewRule({
                                    ...newRule,
                                    productId: product.productId,
                                  });
                                  setShowProductPicker(false);
                                }}
                                className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                              >
                                {product.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {newRule.ruleType === "CATEGORY" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t(
                          "dashboardScreens.createPromotion.selectCategoryTitle"
                        )}
                      </label>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowCategoryPicker(!showCategoryPicker)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg flex justify-between items-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <span>
                            {newRule.categoryValue.length > 0
                              ? newRule.categoryValue.join(", ")
                              : t(
                                  "dashboardScreens.createPromotion.selectCategoriesPlaceholder"
                                )}
                          </span>
                          <FiChevronDown />
                        </button>

                        {showCategoryPicker && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                              <span className="font-medium">
                                {t(
                                  "dashboardScreens.createPromotion.selectCategoryTitle"
                                )}
                              </span>
                              <button
                                onClick={() => setShowCategoryPicker(false)}
                              >
                                <FiX />
                              </button>
                            </div>
                            {categories.map((category) => (
                              <div
                                key={category.categoryId}
                                onClick={() => {
                                  setNewRule((prev) => ({
                                    ...prev,
                                    categoryValue: prev.categoryValue.includes(
                                      category.name
                                    )
                                      ? prev.categoryValue.filter(
                                          (c) => c !== category.name
                                        )
                                      : [...prev.categoryValue, category.name],
                                  }));
                                }}
                                className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center"
                              >
                                <div
                                  className={`w-5 h-5 border border-gray-300 rounded mr-2 ${
                                    newRule.categoryValue.includes(
                                      category.name
                                    )
                                      ? "bg-blue-500 border-blue-500"
                                      : "bg-white"
                                  }`}
                                ></div>
                                {category.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {newRule.ruleType === "CART_VALUE" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t(
                          "dashboardScreens.createPromotion.minimumCartValuePlaceholder"
                        )}
                      </label>
                      <input
                        type="number"
                        placeholder={t(
                          "dashboardScreens.createPromotion.minimumCartValuePlaceholder"
                        )}
                        value={newRule.minCartValue}
                        onChange={(e) =>
                          setNewRule({
                            ...newRule,
                            minCartValue: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.createPromotion.addSectionTitle")}
                    </label>
                    <select
                      value={newAction.actionType}
                      onChange={(e) =>
                        setNewAction({
                          ...newAction,
                          actionType: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">
                        {t(
                          "dashboardScreens.createPromotion.selectDiscountTypePlaceholder"
                        )}
                      </option>
                      <option value="FIXED_OFF">
                        {t(
                          "dashboardScreens.createPromotion.discountAmountPlaceholder"
                        )}
                      </option>
                      <option value="PERCENT_OFF">
                        {t(
                          "dashboardScreens.createPromotion.discountPercentagePlaceholder"
                        )}
                      </option>
                      {newRule.ruleType !== "CATEGORY" && (
                        <option value="FREE_ITEM">
                          {t(
                            "dashboardScreens.createPromotion.freeItemProductPlaceholder"
                          )}
                        </option>
                      )}
                    </select>
                  </div>

                  {newAction.actionType === "FIXED_OFF" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t(
                          "dashboardScreens.createPromotion.discountAmountPlaceholder"
                        )}
                      </label>
                      <input
                        type="number"
                        placeholder={t(
                          "dashboardScreens.createPromotion.discountAmountPlaceholder"
                        )}
                        value={newAction.amount}
                        onChange={(e) =>
                          setNewAction({ ...newAction, amount: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  {newAction.actionType === "PERCENT_OFF" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t(
                          "dashboardScreens.createPromotion.discountPercentagePlaceholder"
                        )}
                      </label>
                      <input
                        type="number"
                        placeholder={t(
                          "dashboardScreens.createPromotion.discountPercentagePlaceholder"
                        )}
                        value={newAction.percentage}
                        onChange={(e) =>
                          setNewAction({
                            ...newAction,
                            percentage: e.target.value,
                          })
                        }
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  {newAction.actionType === "FREE_ITEM" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("dashboardScreens.createPromotion.selectProduct")}
                        </label>
                        <select
                          value={newAction.productId}
                          onChange={(e) =>
                            setNewAction({
                              ...newAction,
                              productId: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">
                            {t(
                              "dashboardScreens.createPromotion.selectProductPlaceholder"
                            )}
                          </option>
                          {products.map((product) => (
                            <option
                              key={product.productId}
                              value={product.productId}
                            >
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t(
                            "dashboardScreens.createPromotion.freeItemQuantityPlaceholder"
                          )}
                        </label>
                        <input
                          type="number"
                          placeholder={t(
                            "dashboardScreens.createPromotion.freeItemQuantityPlaceholder"
                          )}
                          value={newAction.quantity}
                          onChange={(e) =>
                            setNewAction({
                              ...newAction,
                              quantity: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </>
                  )}

                  <button
                    onClick={addRuleActionPair}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {t("dashboardScreens.createPromotion.addPairButton")}
                  </button>
                </div>
              </motion.div>

              {/* Image Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  {t("dashboardScreens.createPromotion.imageLabel")}
                </h3>

                <ImageUploader
                  initialImage={currentImage}
                  onImageSelected={(uri) => {
                    setNewImage(uri);
                    setImageError(null);
                  }}
                  removable
                  onRemoveImage={() => {
                    setNewImage(null);
                  }}
                />

                {imageError && (
                  <p className="text-red-500 text-sm">{imageError}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="pt-4"
              >
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    t("dashboardScreens.createPromotion.submitButton")
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdatePromotion;
