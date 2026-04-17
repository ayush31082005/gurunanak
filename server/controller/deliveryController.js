import { getDistanceInKm } from "../utils/deliveryHelper.js";

export const checkDeliveryTime = async (req, res) => {
    try {
        const { pincode, address } = req.body;

        if (!pincode && !address) {
            return res.status(400).json({
                success: false,
                message: "Pincode ya address bhejo",
            });
        }

        const searchText = address || pincode;

        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchText
        )}.json?access_token=${process.env.MAPBOX_TOKEN}&country=IN&limit=1`;

        const response = await fetch(mapboxUrl);
        const data = await response.json();

        const feature = data?.features?.[0];

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Location nahi mili",
            });
        }

        const [userLng, userLat] = feature.center;

        const storeLat = Number(process.env.STORE_LAT);
        const storeLng = Number(process.env.STORE_LNG);

        const distance = getDistanceInKm(storeLat, storeLng, userLat, userLng);

        const deliveryText =
            distance <= 5 ? "Delivery in 30 min" : "Delivery in 3 days";

        return res.status(200).json({
            success: true,
            userLocation: {
                lat: userLat,
                lng: userLng,
            },
            storeLocation: {
                lat: storeLat,
                lng: storeLng,
            },
            distance: Number(distance.toFixed(2)),
            deliveryText,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Delivery check failed",
            error: error.message,
        });
    }
};
