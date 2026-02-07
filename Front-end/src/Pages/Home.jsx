import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { BaseUrl } from '../BaseApi/Api';
import "./Main.css"
export default function Home() {
  const [allMonths, setAllMonths] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [bankAllExpenses, setBankAllExpenses] = useState([]);
  const [dashboardGraph, setDashboardGrapgh] = useState([]);

  useEffect(() => {
    fetchMonths();
    fetchAllBank();
  }, []);

  useEffect(() => {
    if (!allMonths.length || !bankAllExpenses.length) return;

    const monthlyChartData = allMonths.map((month) => {
      const monthExpenses = bankAllExpenses.filter(
        (exp) => exp.monthId?._id === month._id
      );

      const credit = monthExpenses.reduce(
        (sum, exp) =>
          exp.type === "credit" ? sum + exp.expenseAmount : sum,
        0
      );

      const debit = monthExpenses.reduce(
        (sum, exp) =>
          exp.type === "debit" ? sum + exp.expenseAmount : sum,
        0
      );

      return {
        month: month.monthName,
        credit,
        debit,
      };
    });

    setDashboardGrapgh(monthlyChartData);
  }, [allMonths, bankAllExpenses]);

  useEffect(() => {
    fetchBankExpenses();
  }, [selectedMonthId]);

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

  const fetchAllBank = async () => {
    try {
      const res = await fetch(`${BaseUrl}expensesAllBank`, {
        credentials: "include", // 🔐 cookie auth
      });
      const data = await res.json();

      if (res.ok) {
        // console.log(data);
        setBankAllExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const maxValue = Math.max(
    ...dashboardGraph.flatMap(d => [d.credit, d.debit])
  );

  const debitReasons = expenses
    .filter(exp => exp.type === "debit")
    .reduce((acc, exp) => {
      const reason = exp.reason || "Other";
      acc[reason] = (acc[reason] || 0) + exp.expenseAmount;
      return acc;
    }, {});

  const pieData = Object.entries(debitReasons).map(([reason, value]) => ({
    label: reason,
    value
  }));

  const totalDebit = pieData.reduce((sum, d) => sum + d.value, 0);
  const colors = [
    "#4f46e5", // indigo
    "#22c55e", // green
    "#ef4444", // red
    "#f59e0b", // yellow
    "#0ea5e9", // sky
    "#8b5cf6", // violet
    "#14b8a6", // teal
  ];

  const numberToWords = (num) => {
    if (!num || num === 0) return "Zero";

    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six",
      "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
      "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];

    const b = [
      "", "", "Twenty", "Thirty", "Forty",
      "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const convert = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
      if (n < 100000)
        return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
      if (n < 10000000)
        return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
      return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
    };

    return convert(num) + " Only";
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.expenseAmount, 0);
  const totalCredit = expenses.reduce(
    (sum, exp) => exp.type === "credit" ? sum + exp.expenseAmount : sum,
    0
  );
  const totalDebit1 = expenses.reduce(
    (sum, exp) => exp.type === "debit" ? sum + exp.expenseAmount : sum,
    0
  );

  return (<>
    <div className="w-full px-2 flex flex-col gap-2 py-2 h-full">
      <div className="w-full px-4 py-4 flex items-center justify-between bg-white shadow rounded flex-wrap gap-2">
        <div className="flex gap-2">
          <Link
            to="/bank-expense"
            className="text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            Bank
          </Link>
          {/* <Link
            to="/cash-expense"
            className="text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            Cash
          </Link> */}
          {/* <Link
            to="/accounts"
            className="text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            Accounts
          </Link> */}
          <Link
            to="/months"
            className="text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            Months
          </Link>
        </div>
        <div className='flex justify-end flex-1'>
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
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 md:col-span-2 flex flex-col gap-4">
          <h2 className="text-indigo-500 text-lg">Month summary</h2>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-indigo-600">
            <h3 className="text-gray-500 text-sm">Total Amount</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              ₹{totalAmount}
            </p>
            <p className="text-xs text-gray-500 mt-1 italic">
              {numberToWords(totalAmount)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-600">
            <h3 className="text-gray-500 text-sm">Credit Amount</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              ₹{totalCredit}
            </p>
            <p className="text-xs text-gray-500 mt-1 italic">
              {numberToWords(totalCredit)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm">Debit Amount</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              ₹{totalDebit1}
            </p>
            <p className="text-xs text-gray-500 mt-1 italic">
              {numberToWords(totalDebit1)}
            </p>
          </div>

        </div>

        <div className="col-span-12 md:col-span-6 bg-white rounded-xl shadow p-5 border">
          <h2 className="text-lg font-bold mb-6">
            All Months Credit vs Debit
          </h2>
          <div className="flex items-end gap-6 h-64 border-l border-b pl-4 pb-4">
            {dashboardGraph.map((item, index) => {
              const creditHeight = (item.credit / maxValue) * 100;
              const debitHeight = (item.debit / maxValue) * 100;
              // console.log(item);

              return (
                <div key={index} className="flex flex-col items-center gap-2 w-16">

                  {/* BAR CONTAINER with FIXED HEIGHT */}
                  <div className="flex items-end gap-1.5 h-48">
                    <div title={`${numberToWords(item?.credit)} in ${item?.month}`}
                      className="w-7 bg-green-500 rounded-t transition-all duration-500"
                      style={{ height: `${creditHeight}%` }}
                    />

                    <div title={`${numberToWords(item?.debit)} in ${item?.month}`}
                      className="w-7 bg-red-500 rounded-t transition-all duration-500"
                      style={{ height: `${debitHeight}%` }}
                    />
                  </div>

                  <span className="text-xs font-medium text-gray-600">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              Credit
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              Debit
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white rounded-xl shadow p-5 border">
          <h2 className="text-lg font-bold mb-2"> Debit Reason Distribution</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                {
                  (() => {
                    let cumulative = 0;
                    return pieData.map((item, index) => {
                      const percentage = (item.value / totalDebit) * 100;
                      const dash = `${percentage} ${100 - percentage}`;
                      const strokeDashoffset = 100 - cumulative;
                      cumulative += percentage;

                      return (
                        <circle
                          key={index}
                          r="15.9"
                          cx="18"
                          cy="18"
                          fill="transparent"
                          stroke={colors[index % colors.length]}
                          strokeWidth="3.8"
                          strokeDasharray={dash}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    });
                  })()
                }
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">Total Debit</p>
                <p className="text-xl font-bold text-gray-800">₹{totalDebit}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              {pieData.map((item, index) => {
                const percent = ((item.value / totalDebit) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></span>
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      ₹{item.value} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>)
}