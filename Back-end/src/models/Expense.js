import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    monthId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Month",
        // required: true,
    },

    mode: {
        type: String,
        enum: ["cash", "bank"],
        required: true,
    },

    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
    },

    accountNumber: {
        type: Number,
        // required: true,
    },

    expenseAmount: {
        type: Number,
        required: true,
    },

    particular: {
        type: String,
        required: true,
    },

    reason: {
        type: String,
        // required: true,
    },

    description: String,

    date: {
        type: Date,
        required: true,
    },

    //  balanceAfterTransaction: {
    //   type: Number,
    // //   required: true,
    // },
},
    { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);