import { useEffect, useMemo, useState } from "react";
import { getPublicProducts } from "../api/productApi";
import { normalizeProductForClient } from "../utils/productTransforms";

let remoteProductsCache = null;

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

const useManagedProducts = ({
    fallbackProducts = [],
    allowedCategories = [],
    returnMeta = false,
} = {}) => {
    const [remoteProducts, setRemoteProducts] = useState(() => remoteProductsCache || []);
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(() => Boolean(remoteProductsCache));

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                const response = await getPublicProducts();
                if (!isMounted) return;

                const normalizedRemoteProducts = extractProducts(response.data).map(
                    normalizeProductForClient
                );

                remoteProductsCache = normalizedRemoteProducts;
                setRemoteProducts(normalizedRemoteProducts);
                setHasError(false);
            } catch (_error) {
                if (!isMounted) return;
                setHasError(true);
                setRemoteProducts(remoteProductsCache || []);
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

    const products = useMemo(() => {
        const normalizedFallbackProducts = fallbackProducts.map(normalizeProductForClient);
        const filteredRemoteProducts = filterByAllowedCategories(remoteProducts, allowedCategories);
        const filteredFallbackProducts = filterByAllowedCategories(
            normalizedFallbackProducts,
            allowedCategories
        );

        if (hasError) {
            return filteredFallbackProducts;
        }

        if (!isLoaded) {
            return filteredRemoteProducts;
        }

        return filteredRemoteProducts;
    }, [allowedCategories, fallbackProducts, hasError, isLoaded, remoteProducts]);

    if (returnMeta) {
        return {
            products,
            isLoaded,
            hasError,
        };
    }

    return products;
};

export default useManagedProducts;
