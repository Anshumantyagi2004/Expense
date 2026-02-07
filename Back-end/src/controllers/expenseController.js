import { Expense } from "../models/Expense.js";
import { Month } from "../models/Month.js";

//create bank expense
export const createExpense = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            monthId,
            accountNumber,
            mode,
            type,
            expenseAmount,
            particular,
            description,
            reason,
            date,
        } = req.body;
        const amount = Number(expenseAmount);

        if (
            !monthId ||
            // !accountNumber ||
            !mode ||
            !type ||
            !expenseAmount ||
            !particular ||
            !date
        ) {
            return res.status(400).json({ message: "All required fields missing" });
        }

        const month = await Month.findById(monthId);
        if (!month) {
            return res.status(404).json({ message: "Month not found" });
        }

        // 🔐 BALANCE LOGIC
        if (type === "debit") {
            if (month.openingBalance < amount) {
                return res.status(400).json({ message: "Insufficient balance" });
            }

            month.openingBalance -= amount;
            month.closingBalance += amount;
        }

        if (type === "credit") {
            month.openingBalance += amount;
        }

        await month.save();

        const expense = await Expense.create({
            addedBy: userId,
            monthId,
            accountNumber,
            mode,
            type,
            expenseAmount,
            reason,
            particular,
            description,
            date,
        });

        res.status(201).json({
            message: "Expense added successfully",
            expense,
            // updatedBalance: account.balance,
        });

    } catch (error) {
        console.error("Create Expense Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

//find all bank
export const findAllBankExpenses = async (req, res) => {
    try {
        const { monthId } = req.params;
        // console.log(monthId);

        const expenses = await Expense.find({ mode: "bank", monthId: monthId })
            .populate("monthId", "monthName startFrom startTo openingBalance closingBalance")
            .populate("addedBy", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses,
        });

    } catch (error) {
        console.error("Find Bank Expenses Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bank expenses",
        });
    }
};

//find all cash
export const findAllCashExpenses = async (req, res) => {
    try {
        const { monthId } = req.params;
        // console.log(monthId);

        const expenses = await Expense.find({ mode: "cash", monthId: monthId })
            .populate("monthId", "monthName startFrom startTo openingBalance closingBalance")
            .populate("addedBy", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses,
        });

    } catch (error) {
        console.error("Find Bank Expenses Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bank expenses",
        });
    }
};

//find all bank
export const findAllBank = async (req, res) => {
    try {
        const expenses = await Expense.find({ mode: "bank" })
            .populate("monthId", "monthName startFrom startTo openingBalance closingBalance")
            .populate("addedBy", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses,
        });

    } catch (error) {
        console.error("Find Bank Expenses Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bank expenses",
        });
    }
};

//edit bank expense
export const updateBankExpense = async (req, res) => {
    const { id } = req.params;

    const {
        monthId,
        accountNumber,
        mode,
        type,
        expenseAmount,
        particular,
        description,
        reason,
        date,
    } = req.body;

    try {
        const amount = Number(expenseAmount);
        const oldExpense = await Expense.findById(id);
        if (!oldExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        const month = await Month.findById(monthId);
        if (!month) {
            return res.status(404).json({ message: "Month not found" });
        }

        const oldAmount = Number(oldExpense.expenseAmount);

        if (oldExpense.type === "debit") {
            month.openingBalance += oldAmount;
            month.closingBalance -= oldAmount;
        }

        if (oldExpense.type === "credit") {
            month.openingBalance -= oldAmount;
        }

        if (type === "debit") {
            if (month.openingBalance < amount) {
                return res.status(400).json({ message: "Insufficient balance" });
            }

            month.openingBalance -= amount;
            month.closingBalance += amount;
        }

        if (type === "credit") {
            month.openingBalance += amount;
        }

        await month.save();

        oldExpense.monthId = monthId;
        oldExpense.accountNumber = accountNumber;
        oldExpense.mode = mode;
        oldExpense.type = type;
        oldExpense.expenseAmount = expenseAmount;
        oldExpense.particular = particular;
        oldExpense.description = description;
        oldExpense.reason = reason;
        oldExpense.date = date;
        oldExpense.addedBy = req.user.id;

        await oldExpense.save();

        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            expense: oldExpense,
        });

    } catch (error) {
        console.error("Update Expense Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

//delete bank expense
export const deleteBankExpense = async (req, res) => {
    const { id } = req.params;

    try {
        // 1️⃣ Find expense
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // 2️⃣ Find month
        const month = await Month.findById(expense.monthId);
        if (!month) {
            return res.status(404).json({ message: "Month not found" });
        }

        const amount = Number(expense.expenseAmount);

        // 3️⃣ ROLLBACK balance
        if (expense.type === "debit") {
            month.openingBalance += amount;
            month.closingBalance -= amount;
        }

        if (expense.type === "credit") {
            month.openingBalance -= amount;
        }

        await month.save();

        // 4️⃣ Delete expense
        await Expense.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
        });

    } catch (error) {
        console.error("Delete Expense Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};