import React, { useEffect, useState, useRef } from "react";
import { type Reel, ReelService } from "../services/reelService";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiPlay,
  FiTrash2,
  FiCheck,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { FaCloudUploadAlt } from "react-icons/fa";
import ConfirmationModal from "../components/ConfirmationModal";
import AnimatedAlert from "../components/AnimatedAlert";
import Sidebar from "../components/SideBar";

const ManageReels: React.FC = () => {
  const [videos, setVideos] = useState<Reel[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reelToDelete, setReelToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // États pour les alertes
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const { t } = useTranslation();

  useEffect(() => {
    fetchAllVideos();
  }, []);

  // Fonction pour afficher les alertes
  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const fetchAllVideos = async () => {
    try {
      const data = await ReelService.getAllVideos();
      setVideos(data);
    } catch (error) {
      console.error("Failed to load videos:", error);
      showAlert(
        t("common.error"),
        t("dashboardScreens.manageReels.loadFailed"),
        "error"
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("video/")) {
      showAlert(
        t("common.error"),
        t("dashboardScreens.manageReels.videoOnly"),
        "error"
      );
      return;
    }

    // Vérifier la taille (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      showAlert(
        t("common.error"),
        t("dashboardScreens.manageReels.fileTooLarge"),
        "error"
      );
      return;
    }

    setSelectedFile(file);

    // Simuler la vérification de durée
    setTimeout(() => {
      setUploadProgress(30); // Simulation de vérification
    }, 1000);
  };

  const uploadToCloudinary = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(30);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "gicheteAPP");

      // Simulation d'upload progressif
      const simulateProgress = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(simulateProgress);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dsgnuek6y/video/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(simulateProgress);

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const data = await res.json();
      setUploadProgress(100);

      if (data.secure_url && data.public_id) {
        await handlePublish(data.secure_url, data.public_id);
      } else {
        throw new Error("Upload response missing required data");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showAlert(
        t("common.error"),
        t("dashboardScreens.manageReels.uploadFailed"),
        "error"
      );
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (videoUrl: string, publicId: string) => {
    if (!title.trim()) {
      setTitleError(t("dashboardScreens.manageReels.titleRequired"));
      return;
    }

    try {
      await ReelService.addVideo({
        videoUrl,
        publicId,
        title: title.trim(),
      });

      // Réinitialiser le formulaire
      setTitle("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Recharger la liste
      await fetchAllVideos();

      // Afficher l'alerte de succès
      showAlert(
        t("common.success"),
        t("dashboardScreens.manageReels.publishSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Publish error:", error);
      showAlert(
        t("common.error"),
        t("dashboardScreens.manageReels.publishFailed"),
        "error"
      );
    }
  };

  const handleDeleteClick = (id: number) => {
    setReelToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reelToDelete) return;

    setDeleting(true);
    try {
      await ReelService.deleteVideo(reelToDelete);
      setVideos(videos.filter((video) => video.id !== reelToDelete));
      showAlert(
        t("common.success"),
        t("dashboardScreens.manageReels.deleteSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Delete error:", error);
      showAlert(
        t("common.error"),
        t("dashboardScreens.manageReels.deleteFailed"),
        "error"
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setReelToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setReelToDelete(null);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fonction pour générer l'URL de la miniature
  const getThumbnailUrl = (publicId: string | undefined) => {
    if (!publicId) return "";
    return `https://res.cloudinary.com/dsgnuek6y/video/upload/w_500,h_300,c_fill/${publicId}.jpg`;
  };

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
                  onClick={() => window.history.back()}
                  className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50 mr-2"
                  aria-label={t("common.back")}
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none mr-2">
                  {t("dashboardScreens.manageReels.title")}
                </h1>
                <span className="text-sm text-gray-500">
                  ({videos.length}{" "}
                  {videos.length === 1 ? t("common.video") : t("common.videos")}
                  )
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Upload Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 order-2 lg:order-1"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                  {t("dashboardScreens.manageReels.uploadNew")}
                </h2>

                {/* File Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ${
                    selectedFile
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                  }`}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-3 sm:space-y-4"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <FiCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                      <p className="text-green-700 font-medium text-sm sm:text-base truncate">
                        {selectedFile.name}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSelection();
                          }}
                          className="text-red-500 hover:text-red-700 text-xs sm:text-sm flex items-center"
                        >
                          <FiX className="mr-1" /> {t("common.change")}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <FaCloudUploadAlt className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto" />
                      <p className="text-gray-600 text-sm sm:text-base">
                        {t("dashboardScreens.manageReels.pickVideo")}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        MP4, MOV, AVI (max 100MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4"
                  >
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      {uploadProgress}% {t("common.complete")}
                    </p>
                  </motion.div>
                )}

                {/* Title Input */}
                <div className="mt-4 sm:mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dashboardScreens.manageReels.reelTitle")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setTitleError("");
                    }}
                    placeholder={t(
                      "dashboardScreens.manageReels.titlePlaceholder"
                    )}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {titleError && (
                    <p className="text-red-500 text-sm mt-1">{titleError}</p>
                  )}
                </div>

                {/* Upload Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={uploadToCloudinary}
                  disabled={!selectedFile || uploading}
                  className={`w-full mt-4 sm:mt-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 ${
                    !selectedFile || uploading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      {t("dashboardScreens.manageReels.uploading")}
                    </div>
                  ) : (
                    <>
                      <FiUploadCloud className="inline-block mr-2" />
                      {t("dashboardScreens.manageReels.upload")}
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Videos List */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 sm:space-y-6 order-1 lg:order-2"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                  {t("dashboardScreens.manageReels.yourReels")} ({videos.length}
                  )
                </h2>

                <AnimatePresence>
                  {videos.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow-lg"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiPlay className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {t("dashboardScreens.manageReels.noVideos")}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                      {videos.map((reel, index) => (
                        <motion.div
                          key={reel.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                        >
                          <div className="relative">
                            {/* Video Thumbnail/Player */}
                            <div className="aspect-video bg-black relative">
                              <video
                                ref={(el) => {
                                  if (reel.id) videoRefs.current[reel.id] = el;
                                }}
                                className="w-full h-full object-cover"
                                poster={getThumbnailUrl(reel.publicId)}
                                controls // <-- Les contrôles natifs
                                preload="metadata"
                              >
                                <source src={reel.videoUrl} type="video/mp4" />
                                Votre navigateur ne supporte pas la lecture de
                                vidéos.
                              </video>
                            </div>

                            {/* Video Info */}
                            <div className="p-3 sm:p-4">
                              <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                                {reel.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                {new Date(reel.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteClick(reel.id)}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                              aria-label={t("common.delete")}
                            >
                              <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Modals and Alerts - Outside main content */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title={t("dashboardScreens.manageReels.deleteTitle")}
          message={t("dashboardScreens.manageReels.deleteMessage")}
          confirmText={t("common.delete")}
          cancelText={t("common.cancel")}
          isLoading={deleting}
        />

        <AnimatedAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertVisible(false)}
          duration={5000}
        />
      </div>
    </div>
  );
};

export default ManageReels;
