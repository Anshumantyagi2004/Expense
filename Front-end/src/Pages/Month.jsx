import React, { useState, useEffect } from "react";
import { ArrowBigRightDash, ArrowBigLeftDash, Eye, X, Plus } from "lucide-react";
import { BaseUrl } from "../BaseApi/Api";
import { toast } from "react-hot-toast"

export default function Months() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [formData, setFormData] = useState({
        monthName: "",
        startFrom: "",
        startTo: "",
        openingBalance: "",
        closingBalance: "",
        type: "",
    });
    const [allMonths, setAllMonths] = useState([]);

    useEffect(() => {
        fetchMonths();
    }, []);

    const fetchMonths = async () => {
        try {
            const res = await fetch(BaseUrl + "months", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                // console.log(data);
                setAllMonths(data.months);
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
        if (!formData.monthName || !formData.startFrom || !formData.startTo || !formData.openingBalance) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const res = await fetch(BaseUrl + "months", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                const data = await res.json();
                toast.success("Month Added Successfully")
                fetchMonths()
                setFormData({
                    monthName: "",
                    startFrom: "",
                    startTo: "",
                    openingBalance: "",
                    closingBalance: "",
                    type: "",
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
        <div className="flex min-h-screen bg-gray-100 relative">
            {/* Sidebar */}
            <div className={`bg-white shadow-md transition-all duration-300 md:sticky absolute ${sidebarOpen ? "w-72" : "w-14"}`}>
                <div className="md:flex hidden justify-between items-center p-4 border-b">
                    <h2 className={`text-lg font-bold ${sidebarOpen ? "" : "hidden"}`}>
                        Add Month
                    </h2>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                        {!sidebarOpen ? <ArrowBigRightDash /> : <ArrowBigLeftDash />}
                    </button>
                </div>

                {sidebarOpen && (
                    <div className="p-4 space-y-3 relative">
                        <button style={{ placeItems: "center" }} className="md:hidden block absolute top-2 right-2 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition" onClick={() => setSidebarOpen(false)}>
                            <X />
                        </button>
                        <div>
                            <label className="block text-sm font-medium">Month Name</label>
                            <input type="text" name="monthName" value={formData.monthName} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Start From</label>
                            <input type="date" name="startFrom" value={formData.startFrom} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Start To</label>
                            <input type="date" name="startTo" value={formData.startTo} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
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
                            <label className="block text-sm font-medium">Type</label>
                            <select
                                value={formData?.type}
                                defaultValue=""
                                name="type"
                                onChange={handleChange}
                                className="w-full border px-2 py-1 rounded"
                            >
                                <option value="" disabled>
                                    Select Type
                                </option>
                                <option value="bank">Bank</option>
                                <option value="cash">Cash</option>
                            </select>
                        </div>

                        <button type="submit" onClick={handleSubmit} className="w-full bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700">
                            Add Month
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1  md:p-4 p-2 overflow-auto">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-1">Months
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 md:hidden block rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                    >
                        <Plus size={18} />
                    </button>
                </h2>

                {allMonths.length === 0 ? (
                    <p className="text-gray-500">No months yet.</p>
                ) : (
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-white shadow rounded">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left">Months Name</th>
                                    <th className="px-4 py-2 text-left">From</th>
                                    <th className="px-4 py-2 text-left">To</th>
                                    <th className="px-4 py-2 text-left">Opening Bal</th>
                                    <th className="px-4 py-2 text-left">Closing Bal</th>
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allMonths.map((mon) => (
                                    <tr key={mon?._id} className="border-b">
                                        <td className="px-4 py-2">{mon?.monthName}</td>
                                        <td className="px-4 py-2">{new Date(mon?.startFrom).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">{new Date(mon?.startTo).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">{mon?.openingBalance}</td>
                                        <td className="px-4 py-2">{mon?.closingBalance}</td>
                                        <td className="px-4 py-2">{mon?.type}</td>
                                        <td className="px-4 py-2">
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
