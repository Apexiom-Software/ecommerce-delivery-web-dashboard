import { Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./app/i18n/i18n";
import ProtectedRoute from "./components/ProtectedRoutes";
import Home from "./pages/home";
import ListProducts from "./pages/products";
import CreateProduct from "./pages/createProduct";
import EditProduct from "./pages/editProduct";
import ProductDetails from "./pages/productDetails";
import ListCategories from "./pages/categories";
import CreateCategory from "./pages/createCateogory";
import EditCategory from "./pages/editCategory";
import AdditionalOptionAndCategoryForm from "./pages/additionalOptionAndCategoryForm";
import ListAdditionalOptions from "./pages/additionalOptions";
import ListRequiredOptions from "./pages/requiredOptions";
import RequiredOptionForm from "./pages/requiredOptionForm";
import Analytics from "./pages/analytics";
import CreatePromotion from "./pages/createPromotion";
import UpdatePromotion from "./pages/updatePromotion";
import ListPromotions from "./pages/promotions";
import ManageReels from "./pages/manageReels";
import ManageGame from "./pages/game";
import Impressum from "./pages/impressum";
import AGB from "./pages/agb";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ListProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-product"
            element={
              <ProtectedRoute>
                <CreateProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="edit-product/:id"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="product-details/:id"
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-category"
            element={
              <ProtectedRoute>
                <CreateCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="categories"
            element={
              <ProtectedRoute>
                <ListCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="edit-category/:id"
            element={
              <ProtectedRoute>
                <EditCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="additional-options"
            element={
              <ProtectedRoute>
                <ListAdditionalOptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="additional-option-form"
            element={
              <ProtectedRoute>
                <AdditionalOptionAndCategoryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="additional-option-form/:id"
            element={
              <ProtectedRoute>
                <AdditionalOptionAndCategoryForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="required-options"
            element={
              <ProtectedRoute>
                <ListRequiredOptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="required-option-form"
            element={
              <ProtectedRoute>
                <RequiredOptionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="required-option-form/:id"
            element={
              <ProtectedRoute>
                <RequiredOptionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="promotions"
            element={
              <ProtectedRoute>
                <ListPromotions />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-promotion"
            element={
              <ProtectedRoute>
                <CreatePromotion />
              </ProtectedRoute>
            }
          />

          <Route
            path="update-promotion/:id"
            element={
              <ProtectedRoute>
                <UpdatePromotion />
              </ProtectedRoute>
            }
          />
          <Route
            path="reels"
            element={
              <ProtectedRoute>
                <ManageReels />
              </ProtectedRoute>
            }
          />

          <Route
            path="game"
            element={
              <ProtectedRoute>
                <ManageGame />
              </ProtectedRoute>
            }
          />
          <Route path="impressum" element={<Impressum />} />
          <Route path="agb" element={<AGB />} />
        </Routes>
      </div>
    </I18nextProvider>
  );
}

export default App;
