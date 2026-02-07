import mongoose from "mongoose";

const monthSchema = new mongoose.Schema(
    {
        monthName: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },

        startFrom: {
            type: Date,
            required: true,
        },

        startTo: {
            type: Date,
            required: true,
        },

        openingBalance: {
            type: Number,
            required: true,
            default: 0,
        },

        closingBalance: {
            type: Number,
            default: 0,
        },

        // createdBy: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: "User",
        //   required: true,
        // },
    },
    { timestamps: true }
);

export const Month = mongoose.model("Month", monthSchema);
