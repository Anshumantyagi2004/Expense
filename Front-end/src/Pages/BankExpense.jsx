import React, { useEffect, useState } from "react";
import { ArrowBigRightDash, ArrowBigLeftDash, Eye, IndianRupee, Download, Upload, Trash, Edit, Plus, X } from "lucide-react"
import { toast } from "react-hot-toast"
import { BaseUrl } from "../BaseApi/Api";
import Modal from "./../Components/Modal"
import * as XLSX from "xlsx";

export default function BankExpense() {
    const [allMonths, setAllMonths] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [bankmodal, setBankModal] = useState(false);
    const [bankDocsmodal, setBankDocsModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [modalData, setModalData] = useState();
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedMonthId, setSelectedMonthId] = useState("");
    useEffect(() => {
        fetchMonths();
        fetchBankExpenses()
    }, []);

    useEffect(() => {
        fetchBankExpenses()
        const month = allMonths?.find(
            (acc) => acc?._id === selectedMonthId
        );
        setSelectedMonth(month)
        setFormData({ ...formData, monthId: selectedMonthId, })
    }, [selectedMonthId, allMonths]);

    const fetchMonths = async () => {
        try {
            const res = await fetch(BaseUrl + "monthsByType/" + "bank", {
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
        mode: "bank",
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
    const [expensesDocs, setExpensesDocs] = useState([]);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (!formData.mode || !formData.type || !formData.monthId || !formData.accountNumber || !formData.particular || !formData.expenseAmount || !formData.description || !formData.date) {
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
                    mode: "bank",
                    type: "credit",
                    monthId: selectedMonthId,
                    accountNumber: "",
                    expenseAmount: "",
                    particular: "",
                    description: "",
                    date: new Date().toISOString().split('T')[0],
                });
                fetchBankExpenses();
                fetchMonths();
            }
        } catch (error) {
            console.error("Expense Error:", error);
            toast.error("Server error");
        }
    };

    const handleEdit = async (e) => {
        if (!formData.mode || !formData.type || !formData.monthId || !formData.accountNumber || !formData.particular || !formData.expenseAmount || !formData.description || !formData.date) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            const res = await fetch(BaseUrl + "expenses/bank/" + formData._id, {
                method: "Put",
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
                toast.success("Expense updated successfully");
                setFormData({
                    mode: "bank",
                    type: "credit",
                    monthId: selectedMonthId,
                    accountNumber: "",
                    expenseAmount: "",
                    particular: "",
                    description: "",
                    date: new Date().toISOString().split('T')[0],
                });
                fetchBankExpenses();
                fetchMonths();
            }
        } catch (error) {
            console.error("Expense Error:", error);
            toast.error("Server error");
        }
    };

    const handleDelete = async (e) => {
        try {
            const res = await fetch(BaseUrl + "expenses/bank/" + e._id, {
                method: "Delete",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(e),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed");
                return;
            } else {
                toast.success("Expense deleted successfully");
                setFormData({
                    mode: "bank",
                    type: "credit",
                    monthId: selectedMonthId,
                    accountNumber: "",
                    expenseAmount: "",
                    particular: "",
                    description: "",
                    date: new Date().toISOString().split('T')[0],
                });
                fetchBankExpenses();
                fetchMonths();
            }
        } catch (error) {
            console.error("Expense Error:", error);
            toast.error("Server error");
        }
    };

    const fetchBankExpenses = async () => {
        try {
            const res = await fetch(`${BaseUrl}expenses/bank/all/${selectedMonthId}`, {
                credentials: "include", // 🔐 cookie auth
            });
            const data = await res.json();

            if (res.ok) {
                // console.log(data);
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
                    Month: exp.monthId?.monthName,
                    "Account Number": exp.accountNumber,
                    Type: exp.type.toUpperCase(),
                    Amount: exp.expenseAmount,
                    Particular: exp.particular,
                    Description: exp.description || "",
                    Reason: exp?.reason || "--",
                    "Added By": exp.addedBy?.username,
                }));

                // 🔢 Totals
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

                // ➕ Append summary
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

                resolve(); // ✅ success
            } catch (error) {
                reject(error); // ❌ error
            }
        });

        toast.promise(exportPromise, {
            loading: "Dowloading Excel file...",
            success: "Excel file downloaded",
            error: "Failed to download Excel",
        });
    };

    const [file, setFile] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Preview for images only
        if (selectedFile.type.startsWith("image/")) {
            setPreviewDoc(URL.createObjectURL(selectedFile));
        } else {
            setPreviewDoc(null);
        }
    };

    const uploadDocument = async () => {
        if (!file) {
            toast.error("Select document type and file");
            return;
        }
        if (loading) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("monthId", selectedMonthId);
        try {
            setLoading(true);
            await toast.promise(
                fetch(BaseUrl + "expense/document", {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }).then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || "Upload failed");
                    return data;
                }),
                {
                    loading: "Uploading document...",
                    success: "Document uploaded successfully!",
                    error: "Failed to upload document",
                }
            );

            // Reset after successful upload
            setBankModal(false);
            setFile(null);
            setPreviewDoc(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDocsByMonth = async (monthId) => {
        try {
            const res = await fetch(`${BaseUrl}Docs/month/${monthId}`,
                { credentials: "include", }
            );

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || "Failed to fetch expenses");
                return;
            }
            console.log(data);

            setExpensesDocs(data.docs);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    const [search, setSearch] = useState("");
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);

        const filtered = expenses.filter((exp) => {
            return (
                exp?.particular?.toLowerCase().includes(value) ||
                exp?.reason?.toLowerCase().includes(value) ||
                exp?.description?.toLowerCase().includes(value) ||
                exp?.type?.toLowerCase().includes(value) ||
                exp?.accountNumber?.toString().includes(value) ||
                exp?.addedBy?.username?.toLowerCase().includes(value) ||
                exp?.monthId?.monthName?.toLowerCase().includes(value) ||
                new Date(exp.date).toLocaleDateString().includes(value) ||
                String(exp.expenseAmount).includes(value)
            );
        });

        setFilteredExpenses(filtered);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // change as needed
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
    useEffect(() => {
        setFilteredExpenses(expenses);
    }, [expenses]);
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className="flex bg-gray-100 min-h-screen relative">
            <div className={`bg-white shadow-md transition-all duration-300 md:sticky absolute ${sidebarOpen ? "w-72" : "w-14"}`}>
                <div className="justify-between items-center p-4 border-b md:flex hidden">
                    <h2 className={`text-lg font-bold ${sidebarOpen ? "" : "hidden"}`}>
                        Add Bank Expense
                    </h2>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {!sidebarOpen ? <ArrowBigRightDash /> : <ArrowBigLeftDash />}
                    </button>
                </div>

                {sidebarOpen && (
                    <div className="p-4 space-y-3 relative">
                        <button style={{ placeItems: "center" }} className="md:hidden block absolute top-2 right-2 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition" onClick={() => setSidebarOpen(false)}>
                            <X />
                        </button>
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
                        <div>
                            <label className="block text-sm font-medium">Account No</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        {formData?.type == "debit" &&
                            <div>
                                <label className="block text-sm font-medium">Reason</label>
                                <select
                                    value={formData?.reason}
                                    defaultValue=""
                                    name="reason"
                                    onChange={handleChange}
                                    className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>
                                        Select Type
                                    </option>
                                    <option value="Rent">Rent</option>
                                    <option value="Emp Salary">Emp Salary</option>
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
                                className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                                className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                                className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        {edit ?
                            <button onClick={handleEdit} type="submit" className="w-full bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700">
                                Edit Expense
                            </button>
                            :
                            <button onClick={handleSubmit} type="submit" className="w-full bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700">
                                Add Expense
                            </button>}
                    </div>
                )}
            </div>

            <div className="flex-1 md:p-4 p-2 overflow-auto">
                <div className="bg-white rounded-xl shadow-sm border px-4 py-3 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-1">Bank Expenses
                                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 md:hidden block rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                                >
                                    <Plus size={18} />
                                </button>
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    title="Download in excel"
                                    onClick={dowloadExcel}
                                    className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                                >
                                    <Download size={18} />
                                </button>

                                <button
                                    title="Upload excel Sheet"
                                    onClick={() => setBankModal(true)}
                                    className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                                >
                                    <Upload size={18} />
                                </button>

                                <button
                                    title="See Uploaded Docs"
                                    onClick={() => { setBankDocsModal(true); fetchDocsByMonth(selectedMonthId); }}
                                    className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-end lg:w-auto">
                        <div className="flex items-center gap-4 mt-1 sm:mt-0">
                            <div className="flex flex-col">
                                <span className="text-[10px] sm:text-[11px] text-gray-500">Opening Balance</span>
                                <div className="flex items-center justify-center text-sm font-semibold text-green-600">
                                    <IndianRupee size={12} />
                                    <span>{selectedMonth?.openingBalance || 0}</span>
                                </div>
                            </div>
                            <div className="h-7 w-[1px] bg-gray-200 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] sm:text-[11px] text-gray-500">Closing Balance</span>
                                <div className="flex items-center justify-center text-sm font-semibold text-red-600">
                                    <IndianRupee size={12} />
                                    <span>{selectedMonth?.closingBalance || 0}</span>
                                </div>
                            </div>
                        </div>
                        <select
                            value={selectedMonthId}
                            onChange={(e) => setSelectedMonthId(e.target.value)}
                            className="border border-gray-300 bg-white px-3 py-2 text-sm rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto"
                        >
                            <option value="" disabled>
                                Select Month
                            </option>
                            {allMonths.map((acc) => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.monthName}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            onChange={handleSearchChange}
                            value={search}
                            placeholder="Search transactions..."
                            className="border border-gray-300 px-3 py-2 text-sm rounded-lg outline-none w-full sm:w-60 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {expenses.length === 0 ? (
                    <p className="text-gray-500">No bank expenses yet.</p>
                ) : (
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-white shadow rounded">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-left">Month Name</th>
                                    <th className="px-4 py-2 text-left">Account No</th>
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-left">Amount</th>
                                    <th className="px-4 py-2 text-left">Reason</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-left">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedExpenses.map((exp) => (
                                    <tr key={exp._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2">
                                            {exp.monthId?.monthName}
                                        </td>
                                        <td className="px-4 py-2">
                                            {exp?.accountNumber}
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
                                                <button onClick={() => { setFormData(exp), setEdit(true) }}
                                                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(exp)}
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
                        <div className="flex justify-between items-center mt-4 flex-wrap gap-2 px-4">
                            <p className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className={`px-3 py-1 rounded border text-sm 
                                    ${currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white hover:bg-indigo-50 text-indigo-600"}`}
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded border text-sm transition
                                                ${currentPage === page
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white hover:bg-indigo-50 text-indigo-600"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className={`px-3 py-1 rounded border text-sm 
                                            ${currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white hover:bg-indigo-50 text-indigo-600"}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

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

            <Modal open={bankmodal} onClose={() => setBankModal(false)}>
                <Modal.Header title="Upload Bank Statement" />
                <Modal.Body>
                    <div className="bg-white w-full max-w-md">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-600
                                file:mr-3 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-medium
                               file:bg-indigo-600 file:text-white
                                hover:file:bg-indigo-700 cursor-pointer"
                        />

                        {file && (
                            <div className="mt-4 border rounded-lg p-3">
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Selected:</span> {file.name}
                                </p>

                                {previewDoc ? (
                                    <img
                                        src={previewDoc}
                                        alt="Preview"
                                        className="w-full h-40 object-contain rounded"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-500">PDF preview not available</p>
                                )}
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end w-full gap-2">
                        <button
                            onClick={() => setBankModal(false)}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            Close
                        </button>
                        <button
                            onClick={uploadDocument}
                            disabled={loading} // disable while uploading
                            className={`px-4 py-2 border rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 ${loading ? "cursor-not-allowed opacity-70" : ""
                                }`}
                        >
                            {loading ? "Uploading..." : "Add"}
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal open={bankDocsmodal} onClose={() => setBankDocsModal(false)}>
                <Modal.Header title="Bank Statements" />

                <Modal.Body>
                    {expensesDocs && expensesDocs.length > 0 ? (
                        <div className="space-y-4">
                            {expensesDocs.map((doc, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                                >
                                    {/* Left */}
                                    <div className="flex flex-col">
                                        <p className="font-medium text-gray-800">
                                            {doc.filename || "Bank Statement"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Added by{" "}
                                            {doc?.addedBy?.username}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Uploaded on{" "}
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Right */}
                                    <div className="flex gap-2">
                                        <a
                                            href={doc?.cloudinaryUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 text-sm rounded-md bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                                        >
                                            View
                                        </a>

                                        <a
                                            href={doc?.cloudinaryUrl}
                                            download
                                            className="px-3 py-1.5 text-sm rounded-md bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="text-4xl mb-3">📄</div>
                            <p className="text-gray-600 font-medium">
                                No documents available
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload bank statements for this month
                            </p>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <div className="flex justify-end w-full gap-2">
                        <button
                            onClick={() => setBankDocsModal(false)}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            Close
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
