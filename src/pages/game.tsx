/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  ProductService,
  type Product,
  type PaginatedProductResponse,
} from "../services/productService";
import { GameService, type GameRequest } from "../services/gameService";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiSettings,
  FiGift,
  FiPercent,
} from "react-icons/fi";
import AnimatedAlert from "../components/AnimatedAlert";
import Sidebar from "../components/SideBar";
import { useNavigate } from "react-router-dom";

interface ProductWithProbability {
  productId: number;
  probability: number;
}

const ManageGame: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gameExists, setGameExists] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showMaxProductsAlert, setShowMaxProductsAlert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [gameData, setGameData] = useState<{
    name: string;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    winningPercent: number;
    description: string;
    active: boolean;
    products: ProductWithProbability[];
  }>({
    name: "",
    frequency: "DAILY",
    winningPercent: 0,
    description: "",
    active: false,
    products: [],
  });

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadConfig();
    fetchAllProducts();
  }, []);

  const displayAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const cfg = await GameService.getActiveGame();
      setGameData({
        name: cfg.name,
        frequency: cfg.frequency as "DAILY" | "WEEKLY" | "MONTHLY",
        winningPercent: cfg.winningPercent,
        description: cfg.description || "",
        active: cfg.active,
        products: cfg.products.map((p) => ({
          productId: p.productId,
          probability: p.probability || 0,
        })),
      });
      setGameExists(true);
    } catch {
      setGameExists(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      let page = 0;
      const size = 100;
      const accumulated: Product[] = [];
      while (true) {
        const resp: PaginatedProductResponse =
          await ProductService.getAllProducts(page, size);
        accumulated.push(...resp.content);
        if ((resp as any).last) break;
        page++;
      }
      setAllProducts(accumulated);
    } catch (err: any) {
      displayAlert(
        t("dashboardScreens.gameScreen.errors.generic"),
        err.message || JSON.stringify(err)
      );
    }
  };

  const toggleProduct = (id: number) => {
    const exists = gameData.products.some((p) => p.productId === id);

    if (exists) {
      setGameData({
        ...gameData,
        products: gameData.products.filter((p) => p.productId !== id),
      });
    } else {
      if (gameData.products.length >= 4) {
        setShowMaxProductsAlert(true);
        return;
      }
      setGameData({
        ...gameData,
        products: [...gameData.products, { productId: id, probability: 0 }],
      });
    }
  };

  const handleProbabilityChange = (productId: number, value: string) => {
    if (value === "" || value === ".") {
      setGameData({
        ...gameData,
        products: gameData.products.map((p) =>
          p.productId === productId ? { ...p, probability: 0 } : p
        ),
      });
      return;
    }
    const probability = parseFloat(value);
    if (!isNaN(probability)) {
      setGameData({
        ...gameData,
        products: gameData.products.map((p) =>
          p.productId === productId ? { ...p, probability } : p
        ),
      });
    }
  };

  const calculateTotalProbability = () => {
    return gameData.products.reduce((sum, p) => sum + p.probability, 0);
  };

  const handleSave = async () => {
    if (!gameData.name.trim()) {
      displayAlert(
        t("dashboardScreens.gameScreen.error"),
        t("dashboardScreens.gameScreen.validationErrors.nameRequired")
      );
      return;
    }
    if (gameData.winningPercent <= 0 || gameData.winningPercent > 100) {
      displayAlert(
        t("dashboardScreens.gameScreen.error"),
        t("dashboardScreens.gameScreen.validationErrors.percentageRange")
      );
      return;
    }
    if (gameData.products.length === 0) {
      displayAlert(
        t("dashboardScreens.gameScreen.error"),
        t("dashboardScreens.gameScreen.validationErrors.atLeastOneProduct")
      );
      return;
    }

    const totalProbability = calculateTotalProbability();

    if (Math.abs(totalProbability - gameData.winningPercent) > 0.01) {
      displayAlert(
        t("dashboardScreens.gameScreen.error"),
        t("dashboardScreens.gameScreen.validationErrors.probabilityMismatch", {
          total: totalProbability.toFixed(0),
          winning: gameData.winningPercent,
        })
      );
      return;
    }
    if (totalProbability > gameData.winningPercent) {
      displayAlert(
        t("dashboardScreens.gameScreen.error"),
        t("dashboardScreens.gameScreen.validationErrors.probabilityExceeds", {
          total: totalProbability,
          winning: gameData.winningPercent,
        })
      );
      return;
    }

    setSaving(true);
    const req: GameRequest = {
      name: gameData.name,
      frequency: gameData.frequency,
      winningPercent: gameData.winningPercent,
      description: gameData.description,
      active: gameData.active,
      products: gameData.products.map((p) => ({
        productId: p.productId,
        probability: p.probability,
      })),
    };

    try {
      if (gameExists) {
        await GameService.updateGame(req);
      } else {
        await GameService.createGame(req);
        setGameExists(true);
      }
      displayAlert(
        t("dashboardScreens.gameScreen.success.successTitle"),
        t("dashboardScreens.gameScreen.success.saved")
      );
      await loadConfig();
    } catch (err: any) {
      displayAlert(
        t("dashboardScreens.gameScreen.errors.generic"),
        err.message || JSON.stringify(err)
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50 mr-2"
                  aria-label={t("common.back")}
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none mr-2">
                  {t("dashboardScreens.gameScreen.title")}
                </h1>
                <span className="text-sm text-gray-500">
                  {gameExists
                    ? t("dashboardScreens.gameScreen.configExists")
                    : t("dashboardScreens.gameScreen.newConfig")}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Game Configuration Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <FiSettings className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("dashboardScreens.gameScreen.gameConfiguration")}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.gameScreen.gameName")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={t(
                        "dashboardScreens.gameScreen.gameNamePlaceholder"
                      )}
                      value={gameData.name}
                      onChange={(e) =>
                        setGameData({ ...gameData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.gameScreen.frequency")}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["DAILY", "WEEKLY", "MONTHLY"].map((freq) => (
                        <motion.button
                          key={freq}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-4 py-3 rounded-xl font-medium transition-all ${
                            gameData.frequency === freq
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() =>
                            setGameData({ ...gameData, frequency: freq as any })
                          }
                        >
                          {t(
                            `dashboardScreens.gameScreen.${freq.toLowerCase()}`
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.gameScreen.winningPercentage")}
                    </label>
                    <div className="relative">
                      <FiPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder={t(
                          "dashboardScreens.gameScreen.winningPercentagePlaceholder"
                        )}
                        value={gameData.winningPercent}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0 && val <= 100) {
                            setGameData({ ...gameData, winningPercent: val });
                          } else if (e.target.value === "") {
                            setGameData({ ...gameData, winningPercent: 0 });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboardScreens.gameScreen.description")}
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={t(
                        "dashboardScreens.gameScreen.descriptionPlaceholder"
                      )}
                      value={gameData.description}
                      onChange={(e) =>
                        setGameData({
                          ...gameData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700">
                      {t("dashboardScreens.gameScreen.active")}
                    </label>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        gameData.active ? "bg-green-500" : "bg-gray-300"
                      }`}
                      onClick={() =>
                        setGameData({ ...gameData, active: !gameData.active })
                      }
                    >
                      <motion.div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          gameData.active ? "left-7" : "left-1"
                        }`}
                        layout
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Products Selection Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <FiGift className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("dashboardScreens.gameScreen.productsSelection")}
                  </h2>
                </div>

                <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800 font-medium">
                    {t("dashboardScreens.gameScreen.totalProbability", {
                      total: calculateTotalProbability().toFixed(1),
                      winning: gameData.winningPercent,
                    })}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {t("dashboardScreens.gameScreen.productLimit", {
                      count: gameData.products.length,
                      max: 4,
                    })}
                  </p>
                </div>

                <div className="h-96 overflow-y-auto space-y-3">
                  {allProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {t("dashboardScreens.gameScreen.noProducts")}
                    </div>
                  ) : (
                    allProducts.map((product) => {
                      const selected = gameData.products.find(
                        (p) => p.productId === product.productId
                      );
                      return (
                        <motion.div
                          key={product.productId}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                  selected
                                    ? "bg-blue-500 border-blue-500"
                                    : "bg-white border-gray-300"
                                }`}
                                onClick={() => toggleProduct(product.productId)}
                              >
                                {selected && (
                                  <FiCheck className="w-4 h-4 text-white" />
                                )}
                              </motion.button>
                              <span className="font-medium text-gray-800">
                                {product.name}
                              </span>
                            </div>

                            {selected && (
                              <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm text-center"
                                  value={selected.probability}
                                  onChange={(e) =>
                                    handleProbabilityChange(
                                      product.productId,
                                      e.target.value
                                    )
                                  }
                                  placeholder="0%"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl text-white"
              }`}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  {t("common.processing")}
                </div>
              ) : (
                t("dashboardScreens.gameScreen.saveButton")
              )}
            </motion.button>
          </div>
        </main>

        {/* Alerts */}
        <AnimatedAlert
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />

        <AnimatedAlert
          visible={showMaxProductsAlert}
          title={t("dashboardScreens.gameScreen.errors.maxProductsTitle")}
          message={t("dashboardScreens.gameScreen.errors.maxProductsMessage")}
          onClose={() => setShowMaxProductsAlert(false)}
        />
      </div>
    </div>
  );
};

export default ManageGame;
