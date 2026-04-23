import BankAccount from "../models/BankAccount.js";
import User from "../models/User.js";

const sanitizeBankPayload = (body = {}) => ({
    accountHolderName: String(body.accountHolderName || "").trim(),
    email: String(body.email || "")
        .trim()
        .toLowerCase(),
    mobileNumber: String(body.mobileNumber || "").trim(),
    bankName: String(body.bankName || "").trim(),
    accountNumber: String(body.accountNumber || "").trim(),
    ifscCode: String(body.ifscCode || "")
        .trim()
        .toUpperCase(),
    branchName: String(body.branchName || "").trim(),
    upiId: String(body.upiId || "").trim(),
});

export const createBankAccount = async (req, res) => {
    try {
        const payload = sanitizeBankPayload(req.body);

        if (!payload.accountHolderName || !payload.email || !payload.bankName || !payload.accountNumber || !payload.ifscCode) {
            return res.status(400).json({
                success: false,
                message: "Account holder name, email, bank name, account number and IFSC code are required",
            });
        }

        const bankAccount = await BankAccount.create({
            user: req.user._id,
            email: payload.email || req.user.email,
            mobileNumber: payload.mobileNumber || req.user.phone || "",
            ...payload,
        });

        if (!String(req.user?.name || "").trim() && payload.accountHolderName) {
            await User.findByIdAndUpdate(req.user._id, {
                $set: {
                    name: payload.accountHolderName,
                },
            });
        }

        if (payload.mobileNumber && payload.mobileNumber !== String(req.user?.phone || "").trim()) {
            await User.findByIdAndUpdate(req.user._id, {
                $set: {
                    phone: payload.mobileNumber,
                },
            });
        }

        return res.status(201).json({
            success: true,
            message: "Bank account added successfully",
            bankAccount,
        });
    } catch (error) {
        console.error("Create bank account error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add bank account",
        });
    }
};

export const getMyBankAccounts = async (req, res) => {
    try {
        const bankAccounts = await BankAccount.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            bankAccounts,
        });
    } catch (error) {
        console.error("Get my bank accounts error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bank accounts",
        });
    }
};

export const deleteMyBankAccount = async (req, res) => {
    try {
        const bankAccount = await BankAccount.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!bankAccount) {
            return res.status(404).json({
                success: false,
                message: "Bank account not found",
            });
        }

        await bankAccount.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Bank account removed successfully",
        });
    } catch (error) {
        console.error("Delete bank account error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove bank account",
        });
    }
};

export const getAdminBankAccounts = async (_req, res) => {
    try {
        const bankAccounts = await BankAccount.find()
            .populate("user", "name email phone")
            .sort({ createdAt: -1 });

        await Promise.all(
            bankAccounts.map(async (bankAccount) => {
                const userId = bankAccount.user?._id;
                const userName = String(bankAccount.user?.name || "").trim();
                const fallbackName = String(bankAccount.accountHolderName || "").trim();

                if (userId && !userName && fallbackName) {
                    await User.findByIdAndUpdate(userId, {
                        $set: {
                            name: fallbackName,
                        },
                    });
                    bankAccount.user.name = fallbackName;
                }
            })
        );

        return res.status(200).json({
            success: true,
            bankAccounts,
        });
    } catch (error) {
        console.error("Get admin bank accounts error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bank accounts",
        });
    }
};
