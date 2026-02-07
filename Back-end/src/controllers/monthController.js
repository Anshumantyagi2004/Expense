import { Month } from "../models/Month.js";


// Create Month
export const createMonth = async (req, res) => {
    try {
        const {
            monthName,
            startFrom,
            startTo,
            openingBalance,
            closingBalance,
            type
        } = req.body;

        if (!monthName || !startFrom || !startTo || openingBalance === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const month = await Month.create({
            monthName,
            startFrom,
            startTo,
            openingBalance,
            closingBalance,
            type
            // createdBy: req.user._id,
        });

        res.status(201).json({ month });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get All Months
export const getAllMonths = async (req, res) => {
    try {
        const months = await Month.find()
        // .sort({ startFrom: -1 });

        res.status(200).json({ months });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get all month by type
export const getMonthsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const months = await Month.find({ type: type })
        // .sort({ startFrom: -1 });

        res.status(200).json({ months });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};