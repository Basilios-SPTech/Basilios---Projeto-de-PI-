import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ProductsContext = createContext();

const STORAGE_KEY = "basilios.products.v1";

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (product) => {
    // product: { id, name, description, price, imageDataUrl }
    setProducts((prev) => [product, ...prev]);
  };

  const value = useMemo(() => ({ products, addProduct }), [products]);

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
