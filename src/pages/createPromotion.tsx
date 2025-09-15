/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  PromotionService,
  type Action,
  type Rule,
} from "../services/promotionService";
import { ProductService } from "../services/productService";
import { type Category, CategoryService } from "../services/categoryService";
import { useTranslation } from "react-i18next";
import ImageUploader from "../components/ImageUploader";
import AnimatedAlert from "../components/AnimatedAlert";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronLeft,
  FiEdit,
  FiTrash2,
  FiX,
  FiPlus,
  FiCalendar,
  FiTag,
} from "react-icons/fi";
import Sidebar from "../components/SideBar";
import { useNavigate } from "react-router-dom";

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

const CreatePromotion: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [types, productsResponse, categoriesResponse] = await Promise.all(
          [
            PromotionService.getRuleTypes(),
            ProductService.getAllProducts(0, 100),
            CategoryService.getCategories(),
          ]
        );

        setRuleTypes(types);
        setProducts(productsResponse.content);
        setCategories(categoriesResponse);
      } catch {
        showAlert(
          t("dashboardScreens.createPromotion.errorTitle"),
          t("dashboardScreens.createPromotion.loadingError")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

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

    // CORRECT WAY: Append as Blob like product version
    const promotionRequest = {
      name: formData.name,
      code: formData.code,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      isActive: formData.isActive,
      rules: formData.ruleActionPairs.map((pair) => pair.rule),
      actions: formData.ruleActionPairs.map((pair) => pair.action),
    };

    formPayload.append(
      "promotionRequest",
      new Blob([JSON.stringify(promotionRequest)], { type: "application/json" })
    );

    if (imageUri) {
      // Convert data URL to blob if needed
      let blob: Blob;
      if (imageUri.startsWith("data:")) {
        const response = await fetch(imageUri);
        blob = await response.blob();
      } else {
        // Pour les URI de fichier, convertissez en Blob
        const response = await fetch(imageUri);
        blob = await response.blob();
      }
      formPayload.append("promotionPhotoFile", blob, "promotion-image.jpg");
    }

    try {
      setLoading(true);
      await PromotionService.createPromotion(formPayload);
      showAlert(
        t("dashboardScreens.createPromotion.successTitle"),
        t("dashboardScreens.createPromotion.promotionCreated")
      );
      setTimeout(() => navigate("/promotions"), 1500);
    } catch (error: any) {
      showAlert(
        t("dashboardScreens.createPromotion.errorTitle"),
        error.message ||
          t("dashboardScreens.createPromotion.promotionCreationFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && formData.name === "") {
    return (
      <div className="min-h-screen bg-gray-50 flex-1">
        <div className="fixed top-0 left-0 h-screen z-40 lg:z-auto">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </div>
        <div
          className={`flex-1 transition-all duration-300 lg:ml-72 ${
            sidebarOpen ? "ml-72" : "ml-0"
          }`}
        >
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
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
                <button
                  onClick={() => navigate("/promotions")}
                  className="flex items-center text-gray-600 hover:text-gray-800 mr-4 transition-colors"
                >
                  <FiChevronLeft className="mr-1" />
                  {t("common.back")}
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  {t("dashboardScreens.createPromotion.title")}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 bg-gray-50">
          <AnimatedAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />

          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <h1 className="text-2xl font-bold">
                {t("dashboardScreens.createPromotion.title")}
              </h1>
              <p className="text-purple-200 mt-1">
                {t("dashboardScreens.createPromotion.subtitle")}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiTag className="mr-2" />
                  {t("dashboardScreens.createPromotion.basicInfo")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboardScreens.createPromotion.namePlaceholder")}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder={t(
                        "dashboardScreens.createPromotion.namePlaceholder"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboardScreens.createPromotion.codePlaceholder")}
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder={t(
                        "dashboardScreens.createPromotion.codePlaceholder"
                      )}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Dates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-50 p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="mr-2" />
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
                          startDate: date || formData.startDate,
                        })
                      }
                      selectsStart
                      startDate={formData.startDate}
                      endDate={formData.endDate}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                          endDate: date || formData.endDate,
                        })
                      }
                      selectsEnd
                      startDate={formData.startDate}
                      endDate={formData.endDate}
                      minDate={formData.startDate}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    {t("dashboardScreens.createPromotion.activeLabel")}
                    <div className="relative ml-3">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${
                          formData.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                          formData.isActive ? "transform translate-x-4" : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </motion.div>

              {/* Conditions Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-50 p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  {t("dashboardScreens.createPromotion.conditionsLabel")}
                </h2>

                <AnimatePresence>
                  {formData.ruleActionPairs.map((pair, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-between items-center p-4 mb-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
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
                          className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded hover:bg-indigo-50"
                          title={t("common.edit")}
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => removeRuleActionPair(index)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                          title={t("common.delete")}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add New Condition */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    {t("dashboardScreens.createPromotion.applyLabel")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboardScreens.createPromotion.chooseCondition")}
                      </label>
                      <select
                        value={newRule.ruleType}
                        onChange={(e) =>
                          setNewRule({
                            ...newRule,
                            ruleType: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">
                          {t(
                            "dashboardScreens.createPromotion.chooseCondition"
                          )}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboardScreens.createPromotion.selectProduct")}
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => setShowProductPicker(true)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex justify-between items-center focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                            <FiChevronLeft className="transform -rotate-90" />
                          </button>

                          {showProductPicker && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg w-full max-w-md max-h-96 overflow-hidden">
                                <div className="flex justify-between items-center p-4 border-b">
                                  <h3 className="font-semibold">
                                    {t(
                                      "dashboardScreens.createPromotion.selectProduct"
                                    )}
                                  </h3>
                                  <button
                                    onClick={() => setShowProductPicker(false)}
                                  >
                                    <FiX />
                                  </button>
                                </div>
                                <div className="overflow-y-auto max-h-80">
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
                                      className="p-4 hover:bg-gray-100 cursor-pointer transition-colors"
                                    >
                                      {product.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {newRule.ruleType === "CATEGORY" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t(
                            "dashboardScreens.createPromotion.selectCategories"
                          )}
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => setShowCategoryPicker(true)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex justify-between items-center focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <span>
                              {newRule.categoryValue.length > 0
                                ? newRule.categoryValue.join(", ")
                                : t(
                                    "dashboardScreens.createPromotion.selectCategoriesPlaceholder"
                                  )}
                            </span>
                            <FiChevronLeft className="transform -rotate-90" />
                          </button>

                          {showCategoryPicker && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg w-full max-w-md max-h-96 overflow-hidden">
                                <div className="flex justify-between items-center p-4 border-b">
                                  <h3 className="font-semibold">
                                    {t(
                                      "dashboardScreens.createPromotion.selectCategoryTitle"
                                    )}
                                  </h3>
                                  <button
                                    onClick={() => setShowCategoryPicker(false)}
                                  >
                                    <FiX />
                                  </button>
                                </div>
                                <div className="overflow-y-auto max-h-80 p-2">
                                  {categories.map((category) => (
                                    <div
                                      key={category.categoryId}
                                      onClick={() => {
                                        setNewRule((prev) => ({
                                          ...prev,
                                          categoryValue:
                                            prev.categoryValue.includes(
                                              category.name
                                            )
                                              ? prev.categoryValue.filter(
                                                  (c) => c !== category.name
                                                )
                                              : [
                                                  ...prev.categoryValue,
                                                  category.name,
                                                ],
                                        }));
                                      }}
                                      className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded transition-colors"
                                    >
                                      <div
                                        className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${
                                          newRule.categoryValue.includes(
                                            category.name
                                          )
                                            ? "bg-purple-600 border-purple-600"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {newRule.categoryValue.includes(
                                          category.name
                                        ) && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                      <span>{category.name}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="p-4 border-t">
                                  <button
                                    onClick={() => setShowCategoryPicker(false)}
                                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                  >
                                    {t("common.done")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {newRule.ruleType === "CART_VALUE" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t(
                            "dashboardScreens.createPromotion.minimumCartValuePlaceholder"
                          )}
                        </label>
                        <input
                          type="number"
                          value={newRule.minCartValue}
                          onChange={(e) =>
                            setNewRule({
                              ...newRule,
                              minCartValue: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder={t(
                            "dashboardScreens.createPromotion.minimumCartValuePlaceholder"
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="text-md font-medium text-gray-800 mb-4 mt-6">
                    {t("dashboardScreens.createPromotion.addSectionTitle")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t(
                          "dashboardScreens.createPromotion.selectDiscountTypePlaceholder"
                        )}
                      </label>
                      <select
                        value={newAction.actionType}
                        onChange={(e) =>
                          setNewAction({
                            ...newAction,
                            actionType: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t(
                            "dashboardScreens.createPromotion.discountAmountPlaceholder"
                          )}
                        </label>
                        <input
                          type="number"
                          value={newAction.amount}
                          onChange={(e) =>
                            setNewAction({
                              ...newAction,
                              amount: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder={t(
                            "dashboardScreens.createPromotion.discountAmountPlaceholder"
                          )}
                        />
                      </div>
                    )}

                    {newAction.actionType === "PERCENT_OFF" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t(
                            "dashboardScreens.createPromotion.discountPercentagePlaceholder"
                          )}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newAction.percentage}
                          onChange={(e) =>
                            setNewAction({
                              ...newAction,
                              percentage: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder={t(
                            "dashboardScreens.createPromotion.discountPercentagePlaceholder"
                          )}
                        />
                      </div>
                    )}

                    {newAction.actionType === "FREE_ITEM" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t(
                              "dashboardScreens.createPromotion.selectProduct"
                            )}
                          </label>
                          <select
                            value={newAction.productId}
                            onChange={(e) =>
                              setNewAction({
                                ...newAction,
                                productId: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t(
                              "dashboardScreens.createPromotion.freeItemQuantityPlaceholder"
                            )}
                          </label>
                          <input
                            type="number"
                            value={newAction.quantity}
                            onChange={(e) =>
                              setNewAction({
                                ...newAction,
                                quantity: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder={t(
                              "dashboardScreens.createPromotion.freeItemQuantityPlaceholder"
                            )}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={addRuleActionPair}
                    className="flex items-center justify-center w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    {t("dashboardScreens.createPromotion.addPairButton")}
                  </button>
                </div>
              </motion.div>

              {/* Image Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-50 p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("dashboardScreens.createPromotion.imageLabel")}
                </h2>

                <ImageUploader
                  onImageSelected={(uri) => {
                    setImageUri(uri);
                    setImageError(null);
                  }}
                  removable
                  onRemoveImage={() => {
                    setImageUri(null);
                  }}
                />
                {imageError && (
                  <p className="text-red-500 text-sm mt-2">{imageError}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center pt-6 border-t border-gray-200"
              >
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("common.processing")}
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

export default CreatePromotion;
