import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";

export const createComplaint = async (req, res) => {
    try {
        const { subject, orderId, complaintType, message } = req.body;
        const sanitizedOrderId = String(orderId || "").trim();

        if (!subject || !complaintType || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject, complaint type and message are required",
            });
        }

        let order = null;

        if (sanitizedOrderId) {
            if (!mongoose.Types.ObjectId.isValid(sanitizedOrderId)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid order ID",
                });
            }

            order = await Order.findOne({
                _id: sanitizedOrderId,
                user: req.user._id,
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found for this user",
                });
            }
        }

        const complaint = await Complaint.create({
            user: req.user._id,
            order: order ? order._id : null,
            subject,
            complaintType,
            message,
        });

        return res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            complaint,
        });
    } catch (error) {
        console.error("Create complaint error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit complaint",
        });
    }
};

export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user._id })
            .populate("order", "_id status total createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: complaints.length,
            complaints,
        });
    } catch (error) {
        console.error("Get my complaints error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch complaints",
        });
    }
};

export const getMySingleComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate("order", "_id status total createdAt");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        return res.status(200).json({
            success: true,
            complaint,
        });
    } catch (error) {
        console.error("Get single complaint error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch complaint",
        });
    }
};

export const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("user", "name email")
            .populate("order", "_id status total createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: complaints.length,
            complaints,
        });
    } catch (error) {
        console.error("Get all complaints error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all complaints",
        });
    }
};

export const updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminReply } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        if (status) {
            complaint.status = status;
        }

        if (typeof adminReply === "string") {
            complaint.adminReply = adminReply;
        }

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint updated successfully",
            complaint,
        });
    } catch (error) {
        console.error("Update complaint error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update complaint",
        });
    }
};
