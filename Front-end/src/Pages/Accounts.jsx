import React, { useState, useEffect } from "react";
import { ArrowBigRightDash, ArrowBigLeftDash, Eye } from "lucide-react";
import { BaseUrl } from "../BaseApi/Api";
import { toast } from "react-hot-toast"

export default function Accounts() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [formData, setFormData] = useState({
        accountNo: "",
        accountName: "",
        openingBalance: "",
        closingBalance: "",
        accountType: "",
    });

    const [allAccount, setAllAccount] = useState([]);
    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch(BaseUrl + "accounts", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setAllAccount(data.accounts);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!formData.accountNo || !formData.accountName || !formData.openingBalance) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const res = await fetch(BaseUrl + "accounts", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success("Account Added Successfully")
                setAllAccount([...allAccount, data.account]);
                setFormData({
                    accountNo: "",
                    accountName: "",
                    openingBalance: "",
                    closingBalance: "",
                    accountType: "",
                });
            } else {
                const error = await res.json();
                toast.error(error.message || "Something went wrong");
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`bg-white shadow-md transition-all duration-300 ${sidebarOpen ? "w-80" : "w-16"}`}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className={`text-lg font-bold ${sidebarOpen ? "" : "hidden"}`}>
                        Add Account
                    </h2>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                        {!sidebarOpen ? <ArrowBigRightDash /> : <ArrowBigLeftDash />}
                    </button>
                </div>

                {sidebarOpen && (
                    <form className="p-4 space-y-3" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium">Account No</label>
                            <input type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Account Name</label>
                            <input type="text" name="accountName" value={formData.accountName} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Opening Balance</label>
                            <input type="number" name="openingBalance" value={formData.openingBalance} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Closing Balance</label>
                            <input type="number" name="closingBalance" value={formData.closingBalance} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Account Type</label>
                            <select name="accountType" value={formData.accountType} onChange={handleChange} className="w-full border px-2 py-1 rounded">
                                <option value="">Select Type</option>
                                {/* <option value="bank">Bank</option> */}
                                {/* <option value="cash">Cash</option> */}
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700">
                            Add Account
                        </button>
                    </form>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
                <h2 className="text-xl font-bold mb-4">Accounts</h2>

                {allAccount.length === 0 ? (
                    <p className="text-gray-500">No accounts yet.</p>
                ) : (
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-white shadow rounded">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left">Acc No</th>
                                    <th className="px-4 py-2 text-left">Acc Name</th>
                                    <th className="px-4 py-2 text-left">Opening Bal</th>
                                    <th className="px-4 py-2 text-left">Closing Bal</th>
                                    <th className="px-4 py-2 text-left">Account Type</th>
                                    <th className="px-4 py-2 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAccount.map((acc) => (
                                    <tr key={acc._id} className="border-b">
                                        <td className="px-4 py-2">{acc.accountNo}</td>
                                        <td className="px-4 py-2">{acc.accountName}</td>
                                        <td className="px-4 py-2">{acc.openingBalance}</td>
                                        <td className="px-4 py-2">{acc.closingBalance}</td>
                                        <td className="px-4 py-2">{acc.accountType}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow">
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
