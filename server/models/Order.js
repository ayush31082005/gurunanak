import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
        },
        pack: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: "At least one order item is required",
            },
        },

        shippingInfo: {
            fullName: String,
            phone: String,
            email: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
        },

        paymentMethod: {
            type: String,
            default: "cod",
        },

        subtotal: {
            type: Number,
            default: 0,
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },
        codFee: {
            type: Number,
            default: 0,
        },
        platformFee: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },

        razorpayOrderId: String,
        razorpayPaymentId: String,

        status: {
            type: String,
            default: "pending",
        },

        stockReduced: {
            type: Boolean,
            default: false,
        },

        tracking: [
            {
                status: String,
                message: String,
                timestamp: Date,
            },
        ],
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
