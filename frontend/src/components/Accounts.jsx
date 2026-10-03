import React, { useContext, useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useParams } from "react-router-dom";
import TodoContext from "../context/TodoContext";
import { CalendarClock, X, UserPen } from "lucide-react";
import DeleteModal from "./DeleteModal";

const Accounts = () => {
    const { currentCustomer, setCurrentCustomer, BACKEND_URL, callToast, darkMode, useTitle, confirm, openConfirm, navigate, isLogin } = useContext(TodoContext);
    const [entries, setEntries] = useState([]);
    const [editCustName, setEditCustName] = useState(false);
    const [sortOrder, setSortOrder] = useState("desc");
    const [editName, setEditName] = useState("");
    const [custId, setCustId] = useState("");
    const [form, setForm] = useState({
        accountId: "",
        name: "",
        datetime: "",
        details: "",
        amount: "",
        type: "Withdrawl",
        editingId: null, // 👈 important
    });

    const { customerId } = useParams();

    useTitle(`${form.name} Account`);

    const isFormValid =
        form.accountId &&
        form.datetime &&
        form.details &&
        form.amount &&
        form.type;

    const handleUpdateCustomerName = async (id) => {
        try {
            if (editName.length === 0) {
                return callToast("info", "Input is empty");
            }

            const response = await fetch(`${BACKEND_URL}/account/updateCustomerName/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ editName }),
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                setEditName("");
                await fetchCustomerDetails();
                callToast("success", data.message);
                setCustId("");
                setEditCustName(false);
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const handleUpdateEntries = async (e) => {
        e.preventDefault();

        const { accountId, editingId, datetime, details, amount, type } = form;

        if (!accountId || !datetime || !details || !amount || !type) {
            callToast("error", "All fields are required");
            return;
        }

        const url = editingId
            ? `${BACKEND_URL}/account/editEntry/${accountId}/${editingId}`
            : `${BACKEND_URL}/account/updateEntries`;

        const body = editingId
            ? {
                datetime: new Date(form.datetime).toISOString(), // ✅ ONLY HERE
                details,
                amount: Number(amount),
                type,
            }
            : {
                id: accountId,
                datetime: new Date(form.datetime).toISOString(), // ✅ ONLY HERE
                details,
                amount: Number(amount),
                type,
            };


        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                callToast("error", data.message);
                return;
            }

            callToast("success", data.message);
            setEntries(data.account.formRows);

            setForm((prev) => ({
                ...prev,
                datetime: "",
                details: "",
                amount: "",
                type: "Withdrawl",
                editingId: null,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteEntry = async (entryId) => {
        openConfirm({
            title: "Delete Customer Entry",
            message: "Are you sure you want to delete this entry?",
            onConfirm: async () => {
                if (!form.accountId) return;

                try {
                    const response = await fetch(`${BACKEND_URL}/account/deleteEntry/${form.accountId}/${entryId}`, {
                        method: "DELETE",
                        credentials: "include",
                    });

                    const data = await response.json();
                    if (response.ok) {
                        callToast("success", data.message);
                        setEntries(data.account.formRows);
                    } else {
                        callToast("error", data.message);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        })
    };

    const handleDateChange = (e) => {
        setForm((prev) => ({
            ...prev,
            datetime: e.target.value,
        }));
    };


    const handleEditEntry = (entry) => {
        const utc = new Date(entry.datetime);

        const localForInput = new Date(
            utc.getTime() - utc.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 16);

        setForm((prev) => ({
            ...prev,
            editingId: entry._id,
            datetime: localForInput, // ✅ CORRECT
            details: entry.details,
            amount: entry.amount,
            type: entry.type,
        }));
    };


    // ✅ YOUR KHATA LOGIC
    const totals = entries.reduce(
        (a, e) => {
            if (e.type === "Withdrawl") a.withdrawl += e.amount;
            else a.deposit += e.amount;

            a.balance = a.deposit - a.withdrawl;
            return a;
        },
        { withdrawl: 0, deposit: 0, balance: 0 }
    );

    // 🧾 PDF EXPORT (FIXED)
    const downloadPDF = () => {
        const doc = new jsPDF("p", "mm", "a4");

        const PAGE_WIDTH = 210;
        const MARGIN = 14;

        /* ================= HEADER ================= */
        doc.setFillColor(17, 24, 39); // slate-900
        doc.rect(0, 0, PAGE_WIDTH, 32, "F");

        doc.setTextColor(255);
        doc.setFontSize(18);
        doc.text(`${currentCustomer.name}`, MARGIN, 18);

        doc.setFontSize(10);
        doc.text("Withdrawl & Deposit Ledger", MARGIN, 25);

        doc.setFontSize(9);
        doc.text(
            `Generated on: ${new Date().toLocaleString("en-IN")}`,
            PAGE_WIDTH - MARGIN,
            25,
            { align: "right" }
        );

        /* ================= SUMMARY ================= */
        const summaryY = 42;
        const boxW = 58;
        const boxH = 20;

        // Box borders
        doc.setDrawColor(200);
        doc.setTextColor(0);

        doc.roundedRect(MARGIN, summaryY, boxW, boxH, 3, 3);
        doc.roundedRect(MARGIN + boxW + 6, summaryY, boxW, boxH, 3, 3);
        doc.roundedRect(MARGIN + (boxW + 6) * 2, summaryY, boxW, boxH, 3, 3);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("MONEY withdrawl by", MARGIN + 4, summaryY + 7);
        doc.text(`${currentCustomer.name.toUpperCase()}`, MARGIN + 4, summaryY + 12);

        // MONEY deposit
        doc.text("MONEY deposit BY", MARGIN + boxW + 10, summaryY + 7);
        doc.text(`${currentCustomer.userName.toUpperCase()}`, MARGIN + boxW + 10, summaryY + 12);

        // BALANCE
        doc.text("BALANCE AMOUNT TO", MARGIN + (boxW + 6) * 2 + 4, summaryY + 7);
        doc.text(`${currentCustomer.name.toUpperCase()}`, MARGIN + (boxW + 6) * 2 + 4, summaryY + 12);

        doc.setFontSize(14);
        doc.setTextColor(220, 38, 38);
        doc.text(`Rs. ${totals.withdrawl}`, MARGIN + 4, summaryY + 18);

        doc.setTextColor(22, 163, 74);
        doc.text(`Rs. ${totals.deposit}`, MARGIN + boxW + 10, summaryY + 18);

        doc.setTextColor(0);
        doc.text(`Rs. ${totals.balance.toFixed(2)}`, MARGIN + (boxW + 6) * 2 + 4, summaryY + 18);

        /* ================= TABLE ================= */
        let runningbalance = 0;

        const rows = entries.map((e, i) => {
            runningbalance -= e.type === "Withdrawl" ? e.amount : -e.amount;

            const dt = new Date(e.datetime);

            const dateTime = dt.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });

            return [
                i + 1,
                dateTime,
                e.details,
                e.type === "Withdrawl" ? `Rs. ${e.amount}` : "-",
                e.type === "Deposit" ? `Rs. ${e.amount}` : "-",
                `Rs. ${runningbalance.toFixed(2)}`,
            ];
        });

        autoTable(doc, {
            startY: summaryY + boxH + 12,
            head: [[
                "SR.NO",
                "DATE & TIME",
                "DETAILS",
                "withdrawl",
                "deposit",
                "balance"
            ]],
            body: rows,
            theme: "grid",
            styles: {
                fontSize: 9,
                cellPadding: 4,
                lineColor: [220, 220, 220],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [241, 245, 249], // slate-100
                textColor: 0,
                fontStyle: "bold",
            },
            columnStyles: {
                0: { cellWidth: 14 },
                1: { cellWidth: 40 },
                2: { cellWidth: 44 },
                3: { halign: "right" },
                4: { halign: "right" },
                5: { halign: "right" },
            },
            didDrawPage: () => {
                /* ================= FOOTER ================= */
                const pageHeight = doc.internal.pageSize.height;

                doc.setDrawColor(220);
                doc.line(MARGIN, pageHeight - 16, PAGE_WIDTH - MARGIN, pageHeight - 16);

                doc.setFontSize(8);
                doc.setTextColor(120);
                doc.text(
                    "This is a system-generated khata statement. No signature required.",
                    MARGIN,
                    pageHeight - 10
                );

                doc.text(
                    `Page ${doc.internal.getNumberOfPages()}`,
                    PAGE_WIDTH - MARGIN,
                    pageHeight - 10,
                    { align: "right" }
                );
            },
        });

        doc.save(`${currentCustomer.name.replace(/\s+/g, "_")}_Khata_Statement.pdf`);
    };

    const fetchCustomerDetails = async () => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/account/fetchCustomersDetails/${customerId}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (response.ok) {
                // ✅ THIS WAS MISSING
                setCurrentCustomer(data.data);

                // ✅ load entries from DB
                if (data.data?.formRows) {
                    setEntries(
                        data.data.formRows.map((row) => ({
                            ...row,
                            amount: Number(row.amount),
                        }))
                    );
                }
            } else {
                callToast("error", data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const formatIST = (date) =>
        new Date(date).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const sortedEntries = [...entries].sort((a, b) => {
        const dateA = new Date(a.datetime).getTime();
        const dateB = new Date(b.datetime).getTime();

        return sortOrder === "asc"
            ? dateA - dateB
            : dateB - dateA;
    });

    // Calculate balance in chronological order
    const chronologicalEntries = [...entries].sort(
        (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );

    let runningbalance = 0;

    const balanceMap = {};

    chronologicalEntries.forEach((entry) => {
        const amount = Number(entry.amount);

        if (entry.type === "Withdrawl") {
            runningbalance -= amount;
        } else {
            runningbalance += amount;
        }

        balanceMap[entry._id] = runningbalance;
    });

    useEffect(() => {
        fetchCustomerDetails();
    }, []);

    useEffect(() => {
        if (currentCustomer) {
            setForm((prev) => ({
                ...prev,
                accountId: currentCustomer._id,
                name: currentCustomer.name,
            }));
        }
    }, [currentCustomer]);

    useEffect(() => {
        if (!isLogin) {
            navigate("/login", { replace: true });
        }
    }, [isLogin]);

    return (
        <div className={`min-h-screen ${darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100" : "bg-gradient-to-br from-slate-300 via-slate-100 to-white text-slate-800"} p-6`}>

            {/* HEADER */}
            <div className={`mb-6 ${darkMode ? "bg-black/40 border-white/10" : "bg-white/20 border-black/20"} backdrop-blur border rounded-2xl p-4 flex justify-between items-center account-1`}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="📒 Personal Khata Ledger"
                        value={currentCustomer?.name || ""}
                        className={`${darkMode ? "input-glass-1" : "input-glass-2"} text-xl font-semibold`}
                        readOnly
                    />

                    <button
                        title="Edit"
                        className="absolute top-0 right-0 bottom-0 pr-2 z-100 text-slate-800 dark:text-slate-300 dark:hover:text-slate-800 hover:text-slate-400 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditCustName(true);
                            setEditName(currentCustomer?.name || "");
                            setCustId(currentCustomer?._id);
                        }}
                    >
                        <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>

                <div className="flex gap-3 items-center input-glass account-2">
                    <span
                        className={`font-semibold ${totals.balance > 0
                            ? "text-emerald-400"
                            : totals.balance < 0
                                ? "text-red-400"
                                : "text-slate-400"
                            }`}
                    >
                        Net balance: ₹ {totals.balance.toFixed(2)}
                    </span>

                    <button
                        onClick={downloadPDF}
                        className={`${darkMode ? "bg-emerald-600 hover:bg-emerald-700 text-gray-100" : "bg-emerald-500 hover:bg-emerald-600 text-gray-200"} px-4 py-2 rounded-xl text-sm font-medium`}
                    >
                        Download PDF
                    </button>
                </div>
            </div>

            {/* SUMMARY */}
            <div className="grid md:grid-cols-3 gap-5 mb-6">
                <div className="glass">
                    <p className="text-slate-400 text-sm">Money withdrawl</p>
                    <h2 className="text-3xl font-bold text-red-400">
                        ₹ {totals.withdrawl}
                    </h2>
                </div>

                <div className="glass">
                    <p className="text-slate-400 text-sm">Money deposit</p>
                    <h2 className="text-3xl font-bold text-emerald-400">
                        ₹ {totals.deposit}
                    </h2>
                </div>

                <div className="glass">
                    <p className="text-slate-400 text-sm">Balance Amount</p>
                    <h2 className="text-3xl font-bold">₹ {totals.balance.toFixed(2)}</h2>
                </div>
            </div>

            {/* LEDGER */}
            <div className="glass mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Transaction History</h3>

                    <button
                        type="button"
                        onClick={() =>
                            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                        }
                        className={`px-3 py-2 rounded-xl text-sm font-medium ${darkMode
                            ? "bg-slate-700 hover:bg-slate-600 text-white"
                            : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                            }`}
                    >
                        {sortOrder === "desc" ? "↓ Newest First" : "↑ Oldest First"}
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-2xl">
                    <table className="w-full text-sm">
                        <thead className={`sticky border-b ${darkMode ? "border-white/10" : "border-black/10"} text-slate-400`}>
                            <tr>
                                <th className={`sticky top-0 z-20 p-3 pl-10 text-left ${darkMode ? "bg-slate-800" : "bg-slate-300 text-slate-600"}`}>Sr.no</th>
                                <th className={`sticky top-0 z-20 p-3 text-left ${darkMode ? "bg-slate-800" : "bg-slate-300 text-slate-600"}`}>Date</th>
                                <th className={`sticky top-0 z-20 p-3 text-left ${darkMode ? "bg-slate-800" : "bg-slate-300 text-slate-600"}`}>Details</th>
                                <th className={`sticky top-0 z-20 p-3 text-right ${darkMode ? "bg-slate-800" : "bg-slate-300 text-slate-600"}`}>Withdrawl</th>
                                <th className={`sticky top-0 z-20 p-3 text-right ${darkMode ? "bg-slate-800" : "bg-slate-300 text-slate-600"}`}>Deposit</th>
                                <th className={`sticky top-0 z-20 p-3 text-right ${darkMode ? "bg-slate-800" : "bg-slate-300 text-slate-600"}`}>Balance</th>
                                <th className={`sticky top-0 z-20 p-3 pr-10 text-right ${darkMode ? "bg-slate-800" : "bg-slate-300 text-slate-600"}`}>Action</th>
                            </tr>
                        </thead>


                        <tbody>
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-slate-400">
                                        No entries yet
                                    </td>
                                </tr>
                            )}

                            {sortedEntries.map((e, i) => {
                                const balance = balanceMap[e._id];

                                return (
                                    <tr
                                        key={e._id}
                                        className={`border-b ${darkMode ? "border-white/5" : "border-black/5"} ${form.editingId === e._id
                                            ? darkMode
                                                ? "bg-slate-500/10"
                                                : "bg-slate-100/10"
                                            : darkMode
                                                ? "hover:bg-white/5"
                                                : "hover:bg-black/5"
                                            }`}
                                    >
                                        <td className="p-3 pl-10">{i + 1}</td>
                                        <td className="p-3">{formatIST(e.datetime)}</td>
                                        <td className="p-3">{e.details}</td>
                                        <td className="p-3 text-right text-red-400">{e.type === "Withdrawl" ? `₹${e.amount}` : "—"}</td>
                                        <td className="p-3 text-right text-emerald-400">{e.type === "Deposit" ? `₹${e.amount}` : "—"}</td>
                                        <td className="p-3 text-right">₹{balance.toFixed(2)}</td>
                                        <td className="p-3 pr-10 flex justify-end gap-2">
                                            <button
                                                className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-xs"
                                                onClick={() => handleEditEntry(e)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                                                onClick={() => handleDeleteEntry(e._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* ADD ENTRY */}
            <div className="glass">
                <h3 className="font-semibold mb-4">Add Khata Entry</h3>

                {form.editingId && (
                    <div className={`mb-3 ${darkMode ? "text-yellow-400" : "text-yellow-900"} text-sm`}>
                        ✏️ Editing entry — click <b>Update</b> to save changes
                    </div>
                )}

                <form onSubmit={handleUpdateEntries} className="grid md:grid-cols-5 gap-4">

                    <div className="relative w-full">
                        {!form.datetime && (
                            <label className={`lg:hidden absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-white/70" : "text-black/70"} pointer-events-none`}>
                                dd / mm / yyyy, -- : -- --
                            </label>
                        )}

                        <input
                            type="datetime-local"
                            className={`${darkMode ? "input-glass-1" : "input-glass-2"} w-full pr-12 appearance-none`}
                            value={form.datetime || ""}
                            onChange={handleDateChange}
                            required
                        />


                        <CalendarClock
                            size={18}
                            className={`lg:hidden absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-400" : "text-slate-800"} pointer-events-none`}
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Reason / Details"
                        value={form.details}
                        onChange={(e) =>
                            setForm({ ...form, details: e.target.value })
                        }
                        className={`${darkMode ? "input-glass-1" : "input-glass-2"}`}
                        required
                    />

                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={(e) => {
                            const value = e.target.value;

                            if (/^-?\d*\.?\d*$/.test(value)) {
                                setForm((prev) => ({
                                    ...prev,
                                    amount: value,
                                }));
                            }
                        }}
                        className={`${darkMode ? "input-glass-1" : "input-glass-2"}`}
                        required
                    />

                    <select
                        value={form.type}
                        onChange={(e) =>
                            setForm({ ...form, type: e.target.value })
                        }
                        className={`${darkMode ? "input-glass-1" : "input-glass-2"}`}
                    >
                        <option>Withdrawl</option>
                        <option>Deposit</option>
                    </select>

                    <div className="flex flex-row gap-2 text-slate-200">
                        {form.editingId ? (

                            <button
                                disabled={!isFormValid}
                                className={`rounded-xl w-1/2 py-1 font-medium ${!isFormValid
                                    ? "bg-slate-600 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                            >
                                Update
                            </button>
                        ) : (
                            <button
                                disabled={!isFormValid}
                                className={`py-1 w-1/2 rounded-xl font-medium text-slate-200 ${!isFormValid
                                    ? "bg-slate-600 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                            >
                                Save
                            </button>
                        )
                        }
                        <button
                            type="button"
                            onClick={() =>
                                setForm((prev) => ({
                                    ...prev,
                                    datetime: "",
                                    details: "",
                                    amount: "",
                                    type: "Withdrawl",
                                    editingId: null,
                                }))
                            }
                            className="bg-slate-600 hover:bg-slate-700 rounded-xl font-medium w-1/2 py-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {editCustName && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">

                    <div className="relative w-full max-w-md mx-4 rounded-2xl 
      bg-white/90 dark:bg-slate-900/90 
      backdrop-blur-xl shadow-2xl 
      border border-black/10 dark:border-white/10 
      animate-scaleIn">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <UserPen className="text-emerald-500" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Edit Customer Name
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Update customer information
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setEditCustName(false)}
                                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                            >
                                <X className="text-slate-500" size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Customer Name
                            </label>

                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter customer name"
                                className="w-full rounded-xl px-4 py-2.5
          bg-white dark:bg-slate-800
          border border-black/10 dark:border-white/10
          focus:outline-none focus:ring-2 focus:ring-emerald-500
          text-slate-900 dark:text-white"
                            />

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                This name will be reflected across all ledger entries.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10">
                            <button
                                onClick={() => setEditCustName(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium
          bg-slate-200 dark:bg-slate-700
          text-slate-700 dark:text-slate-200
          hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleUpdateCustomerName(custId)}
                                className="px-5 py-2 rounded-xl text-sm font-semibold
          bg-emerald-600 hover:bg-emerald-700
          text-white transition shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {
                confirm.open && (<DeleteModal />)
            }
        </div>
    );
};

export default Accounts;
