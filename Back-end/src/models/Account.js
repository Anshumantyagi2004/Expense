import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    accountNo: { type: String, required: true },
    accountName: { type: String, required: true },
    openingBalance: { type: Number, required: true },
    closingBalance: { type: Number },
    accountType: {
        type: String,
        // enum: ["bank", "cash"],
        //  required: true 
    },
}, { timestamps: true });

export const Account = mongoose.model('Account', accountSchema);