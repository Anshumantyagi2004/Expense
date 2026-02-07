import React, { useEffect, useState } from "react";
import { ArrowBigRightDash, ArrowBigLeftDash, Eye, IndianRupee, Download, Edit, Trash } from "lucide-react"
import { toast } from "react-hot-toast"
import { BaseUrl } from "../BaseApi/Api";
import Modal from "./../Components/Modal"
import * as XLSX from "xlsx";

export default function CashExpense() {
    const [allMonths, setAllMonths] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [modalData, setModalData] = useState();
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedMonthId, setSelectedMonthId] = useState("");
    useEffect(() => {
        fetchMonths();
        fetchCashExpenses()
    }, []);

    useEffect(() => {
        fetchCashExpenses()
        const month = allMonths?.find(
            (acc) => acc?._id === selectedMonthId
        );
        setSelectedMonth(month)
        setFormData({ ...formData, monthId: selectedMonthId, })
    }, [selectedMonthId, allMonths]);

    const fetchMonths = async () => {
        try {
            const res = await fetch(BaseUrl + "monthsByType/" + "cash", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                // console.log(data);
                setAllMonths(data.months);
                setSelectedMonthId(data.months[1]?._id)
            }
        } catch (err) {
            console.log(err);
        }
    };

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [formData, setFormData] = useState({
        mode: "cash",
        type: "credit",
        monthId: selectedMonthId,
        accountNumber: "",
        reason: "",
        particular: "",
        expenseAmount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
    });

    const [expenses, setExpenses] = useState([]);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (!formData.mode || !formData.type || !formData.monthId || !formData.particular || !formData.expenseAmount || !formData.description || !formData.date) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            const res = await fetch(BaseUrl + "expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to add expense");
                return;
            } else {
                toast.success("Expense added successfully");
                setFormData({
                    mode: "cash",
                    type: "credit",
                    monthId: selectedMonthId,
                    accountNumber: "",
                    expenseAmount: "",
                    particular: "",
                    description: "",
                    date: new Date().toISOString().split('T')[0],
                });
                fetchCashExpenses();
                fetchMonths();
            }
        } catch (error) {
            console.error("Expense Error:", error);
            toast.error("Server error");
        }
    };

    const fetchCashExpenses = async () => {
        try {
            const res = await fetch(`${BaseUrl}expenses/cash/all/${selectedMonthId}`, {
                credentials: "include", // 🔐 cookie auth
            });
            const data = await res.json();

            if (res.ok) {
                console.log(data);

                setExpenses(data.expenses);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const dowloadExcel = () => {
        const exportPromise = new Promise((resolve, reject) => {
            try {
                const excelData = expenses.map((exp) => ({
                    Date: new Date(exp.date).toLocaleDateString(),
                    "Month": exp.monthId?.monthName,
                    // "Account Number": exp.accountNumber,
                    Type: exp.type.toUpperCase(),
                    Amount: exp.expenseAmount,
                    Particular: exp.particular,
                    Description: exp.description || "",
                    Reason: exp?.reason || "--",
                    "Added By": exp.addedBy?.username,
                }));

                const totalCreditAmount = expenses.reduce(
                    (sum, exp) => exp.type === "credit" ? sum + exp.expenseAmount : sum,
                    0
                );

                const totalDebitAmount = expenses.reduce(
                    (sum, exp) => exp.type === "debit" ? sum + exp.expenseAmount : sum,
                    0
                );

                const totalCreditCount = expenses.filter(e => e.type === "credit").length;
                const totalDebitCount = expenses.filter(e => e.type === "debit").length;

                excelData.push(
                    {},
                    { Date: "SUMMARY" },
                    { Date: "Total Credit Amount", Amount: totalCreditAmount },
                    { Date: "Total Debit Amount", Amount: totalDebitAmount },
                    { Date: "Total Credit Transactions", Amount: totalCreditCount },
                    { Date: "Total Debit Transactions", Amount: totalDebitCount }
                );

                const worksheet = XLSX.utils.json_to_sheet(excelData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Expenses");

                XLSX.writeFile(workbook, "bank-expenses.xlsx");

                resolve();
            } catch (error) {
                reject(error);
            }
        });

        toast.promise(exportPromise, {
            loading: "Dowloading Excel file...",
            success: "Excel file downloaded",
            error: "Failed to download Excel",
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className={`bg-white shadow-md transition-all duration-300 ${sidebarOpen ? "w-80" : "w-16"}`}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className={`text-lg font-bold ${sidebarOpen ? "" : "hidden"}`}>
                        Add Cash Expense
                    </h2>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {!sidebarOpen ? <ArrowBigRightDash /> : <ArrowBigLeftDash />}
                    </button>
                </div>

                {sidebarOpen && (
                    <div className="p-4 space-y-3">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "credit" })}
                                className={`px-4 py-2 rounded-md text-white transition
                                ${formData.type === "credit"
                                        ? "bg-green-600"
                                        : "bg-gray-400 hover:bg-green-500"
                                    }`}
                            >
                                Credit
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "debit" })}
                                className={`px-4 py-2 rounded-md text-white transition
                                    ${formData.type === "debit"
                                        ? "bg-red-600"
                                        : "bg-gray-400 hover:bg-red-500"
                                    }`}
                            >
                                Debit
                            </button>
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium">Account No</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded"
                                required
                            />
                        </div> */}

                        {formData?.type == "debit" &&
                            <div>
                                <label className="block text-sm font-medium">Reason</label>
                                <select
                                    value={formData?.reason}
                                    defaultValue=""
                                    name="reason"
                                    onChange={handleChange}
                                    className="w-full border px-2 py-1 rounded"
                                >
                                    <option value="" disabled>
                                        Select Type
                                    </option>
                                    <option value="Rent">Rent</option>
                                    <option value="Electricity Bill">Electricity Bill</option>
                                    <option value="Wifi Bill">Wifi Bill</option>
                                    <option value="Water Bill">Water Bill</option>
                                    <option value="Food Bill">Food Bill</option>
                                    <option value="Office Expense">Office Expense</option>
                                </select>
                            </div>}

                        <div>
                            <label className="block text-sm font-medium">Particular</label>
                            <input
                                type="text"
                                name="particular"
                                value={formData.particular}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Expense Amount</label>
                            <input
                                type="number"
                                name="expenseAmount"
                                value={formData.expenseAmount}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded"
                            />
                        </div>

                        <button onClick={handleSubmit} type="submit" className="w-full bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700">
                            Add Expense
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 overflow-auto">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <h2 className="text-xl font-bold">Cash Expenses</h2>
                        <button onClick={dowloadExcel} className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
                            <Download size={18} />
                        </button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <select
                            value={selectedMonthId}
                            defaultValue=""
                            onChange={(e) => setSelectedMonthId(e.target.value)}
                            className="border px-3 py-2 rounded outline-none"
                        >
                            <option value="" disabled>
                                Select Type
                            </option>
                            {allMonths.map((acc) => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.monthName}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-col">
                            <h2 className="text-xs font-bold flex">Opening Balance :<span className="text-green-600 flex items-center"><IndianRupee size={12} /> {selectedMonth?.openingBalance}</span></h2>
                            <h2 className="text-xs font-bold flex">Closing Balance :<span className="text-red-600 flex items-center"><IndianRupee size={12} /> {selectedMonth?.closingBalance}</span></h2>
                        </div>
                    </div>
                </div>

                {expenses.length === 0 ? (
                    <p className="text-gray-500">No cash expenses yet.</p>
                ) : (
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-white shadow rounded">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-left">Month Name</th>
                                    {/* <th className="px-4 py-2 text-left">Account No</th> */}
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-left">Amount</th>
                                    {/* <th className="px-4 py-2 text-left">Opening Bal</th> */}
                                    <th className="px-4 py-2 text-left">Reason</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-left">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {expenses.map((exp) => (
                                    <tr key={exp._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2">
                                            {exp.monthId?.monthName}
                                        </td>
                                        <td
                                            className={`px-4 py-2 font-semibold ${exp.type === "credit"
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {exp.type.toUpperCase()}
                                        </td>
                                        <td className="px-4 py-2">
                                            ₹{exp.expenseAmount}
                                        </td>
                                        <td className="px-4 py-2">
                                            {exp?.reason || "--"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {exp?.description}
                                        </td>
                                        <td className="px- py-2">
                                            <div className="flex gap-2">
                                                <button onClick={() => { setModalOpen(true); setModalData(exp) }}
                                                    className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => ""}
                                                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => ""}
                                                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition">
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th className="px-4 py-2 text-left" colSpan={1}>Total Credit :</th>
                                    <td className="px-4 py-2" colSpan={1}>
                                        {expenses.reduce((sum, exp) => {
                                            return exp.type === "credit" ? sum + exp.expenseAmount : sum;
                                        }, 0)}
                                    </td>
                                    <th className="px-4 py-2 text-left" colSpan={1}>Total Debit :</th>
                                    <td className="px-4 py-2" colSpan={1}>
                                        {expenses.reduce((sum, exp) => {
                                            return exp.type === "debit" ? sum + exp.expenseAmount : sum;
                                        }, 0)}
                                    </td>
                                    {/* <td className="px-4 py-2" colSpan={1}></td> */}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Modal.Header title="Details" />
                <Modal.Body>
                    {modalData && (
                        <div className="space-y-3 text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500">Added By</p>
                                    <p className="font-semibold ml-1">{modalData?.addedBy?.username}</p>
                                </div>

                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-semibold ml-1">
                                        {new Date(modalData.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500">Month</p>
                                    <p className="font-medium ml-1">{modalData?.monthId?.monthName}</p>
                                </div>

                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500">Account Number</p>
                                    <p className="font-medium ml-1">{modalData?.accountNumber}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Transaction Type</p>
                                    <span
                                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${modalData.type === "credit"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {modalData.type.toUpperCase()}
                                    </span>
                                </div>

                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500">Expense Amount</p>
                                    <p className="font-bold ml-1">
                                        ₹ {modalData?.expenseAmount}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500">Reason</p>
                                    <p className="font-medium ml-1">{modalData?.reason}</p>
                                </div>

                                <div className="rounded-lg">
                                    <p className="text-sm text-gray-500">Particular</p>
                                    <p className="font-medium ml-1">{modalData?.particular}</p>
                                </div>
                            </div>
                            {modalData?.description && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Description</p>
                                    <p className="bg-gray-50 border px-2 py-1 rounded-md">
                                        {modalData.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end w-full">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            Close
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
