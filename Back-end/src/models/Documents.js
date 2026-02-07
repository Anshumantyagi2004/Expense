import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        monthId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Month",
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
        cloudinaryUrl: {
            type: String,
            required: true,
        },
        cloudinaryId: { // Cloudinary public ID to delete if needed
            type: String,
            required: true,
        },
        fileType: String,
        size: Number,
    },
    { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);