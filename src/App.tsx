import { Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./app/i18n/i18n";
import ProtectedRoute from "./components/ProtectedRoutes";
import Home from "./pages/home";
import ListProducts from "./pages/products";
import CreateProduct from "./pages/createProduct";
import EditProduct from "./pages/editProduct";

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
          {/* Autres routes protégées */}
        </Routes>
      </div>
    </I18nextProvider>
  );
}

export default App;
