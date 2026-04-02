// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
    cloudinary.config(cloudinaryUrl);
} else {
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
}

export default cloudinary;
