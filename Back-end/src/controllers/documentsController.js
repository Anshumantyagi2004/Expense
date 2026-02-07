import { Document } from "../models/Documents.js";

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const { monthId } = req.body;
        const doc = await Document.create({
            monthId,
            addedBy: req.user.id,
            filename: req.file.originalname,
            cloudinaryUrl: req.file.path,
            cloudinaryId: req.file.filename,
            fileType: req.file.mimetype,
            size: req.file.size,
        });

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document: doc,
        });
    } catch (error) {
        console.error("Upload Document Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//find
export const findDocsByMonth = async (req, res) => {
    try {
        const { monthId } = req.params;

        if (!monthId) {
            return res.status(400).json({ message: "Month ID is required" });
        }

        const docs = await Document.find({ monthId })
            .populate("monthId", "monthName startFrom startTo")
            .populate("addedBy", "username email")
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: docs.length,
            docs,
        });

    } catch (error) {
        console.error("Find Expenses By Month Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch docs",
        });
    }
};