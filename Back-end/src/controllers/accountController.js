// controllers/accountController.js
import { Account } from '../models/Account.js';

export const addAccount = async (req, res) => {
    const { accountNo, accountName, openingBalance, closingBalance, accountType } = req.body;

    try {
        const account = await Account.create({
            userId: req.user.id, // from JWT middleware
            accountNo,
            accountName,
            openingBalance,
            closingBalance,
            accountType,
        });

        res.status(201).json({ success: true, account });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find();
        res.status(200).json({ success: true, accounts });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
