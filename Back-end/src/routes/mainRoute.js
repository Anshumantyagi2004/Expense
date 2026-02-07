
import express from 'express';
import { signup, login, getMe, logout } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { addAccount, getAccounts } from '../controllers/accountController.js';
import { createExpense, findAllBankExpenses, findAllCashExpenses, findAllBank, updateBankExpense, deleteBankExpense } from '../controllers/expenseController.js';
import { createMonth, getAllMonths, getMonthsByType } from '../controllers/monthController.js';
import { findDocsByMonth, uploadDocument } from '../controllers/documentsController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.get("/me", authenticateJWT, getMe);
router.post("/logout", logout);
router.post("/accounts", authenticateJWT, addAccount);
router.get("/accounts", authenticateJWT, getAccounts);
router.post("/expenses", authenticateJWT, createExpense);
router.put("/expenses/bank/:id", authenticateJWT, updateBankExpense);
router.delete("/expenses/bank/:id", authenticateJWT, deleteBankExpense);
router.get("/expenses/bank/all/:monthId", authenticateJWT, findAllBankExpenses);
router.get("/expensesAllBank", authenticateJWT, findAllBank);
router.get("/expenses/cash/all/:monthId", authenticateJWT, findAllCashExpenses);
router.post("/months", authenticateJWT, createMonth);
router.get("/months", authenticateJWT, getAllMonths);
router.get("/monthsByType/:type", authenticateJWT, getMonthsByType);
router.post("/expense/document", authenticateJWT, upload.single("file"), uploadDocument);
router.get("/Docs/month/:monthId", authenticateJWT, findDocsByMonth);
export default router;