import { useEffect, useMemo, useState } from "react";
import API from "../api";
import { normalizeProductForClient } from "../utils/productTransforms";

const extractProducts = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.products)) return responseData.products;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const filterByAllowedCategories = (products, allowedCategories = []) => {
    if (!allowedCategories.length) {
        return products;
    }

    const allowedSet = new Set(
        allowedCategories.map((category) => category.trim().toLowerCase())
    );

    return products.filter((product) =>
        allowedSet.has((product.category || "").trim().toLowerCase())
    );
};

const useManagedProducts = ({ fallbackProducts = [], allowedCategories = [] } = {}) => {
    const [remoteProducts, setRemoteProducts] = useState([]);
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                const response = await API.get("/products");
                if (!isMounted) return;

                setRemoteProducts(
                    extractProducts(response.data).map(normalizeProductForClient)
                );
                setHasError(false);
            } catch (_error) {
                if (!isMounted) return;
                setHasError(true);
                setRemoteProducts([]);
            } finally {
                if (isMounted) {
                    setIsLoaded(true);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    return useMemo(() => {
        const normalizedFallbackProducts = fallbackProducts.map(normalizeProductForClient);
        const filteredRemoteProducts = filterByAllowedCategories(remoteProducts, allowedCategories);
        const filteredFallbackProducts = filterByAllowedCategories(
            normalizedFallbackProducts,
            allowedCategories
        );

        if (hasError || !isLoaded || filteredRemoteProducts.length === 0) {
            return filteredFallbackProducts;
        }

        return filteredRemoteProducts;
    }, [allowedCategories, fallbackProducts, hasError, isLoaded, remoteProducts]);
};

export default useManagedProducts;
