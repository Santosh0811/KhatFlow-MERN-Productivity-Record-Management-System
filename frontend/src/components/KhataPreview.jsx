import React, { useContext, useEffect, useState } from "react";
import { CalendarDays, FileText, Layers, X } from "lucide-react";
import TodoContext from "../context/TodoContext";
import DeleteModal from "./DeleteModal";

const KhataPreview = (props) => {
    const { fetchKhatas, khatas, darkMode, callToast, BACKEND_URL, confirm, openConfirm } = useContext(TodoContext);
    const [activeKhata, setActiveKhata] = useState(null);
    const { setTitle, setDate, setSelected, setMonth, setRows, setKhataId, setIsUpdate } = props;

    const getTotal = (rows) => rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const handleSetData = ({ title, date, rows, id }) => {
        setTitle(title);
        setDate(date);

        const parsedDate = new Date(date);

        setSelected(parsedDate);
        setMonth(parsedDate);

        setRows(rows);
        setKhataId(id);
        setIsUpdate(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDeleteKhata = async (id) => {
        openConfirm({
            title: "Delete Todo",
            message: "Are you sure you want to delete this item?",
            onConfirm: async () => {
                try {
                    if (id.length === 0) {
                        return callToast("info", "Khata not found");
                    }

                    const response = await fetch(`${BACKEND_URL}/khata/deleteKhata/${id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    })

                    const data = await response.json();

                    if (response.ok) {
                        callToast("success", data.message);
                        await fetchKhatas();
                    }
                    else {
                        callToast("error", data.message);
                    }

                } catch (error) {
                    console.log(error);
                }
            }
        })
    }

    useEffect(() => {
        fetchKhatas();
    }, []);

    // ESC key close
    useEffect(() => {
        const handleEsc = (e) => e.key === "Escape" && setActiveKhata(null);
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <>
            {/* ===== PREVIEW CARDS ===== */}
            <div className="mt-14">
                <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"} mb-6`}>
                    Recent Khata Ledgers
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 w-[20em] lg:w-[60em]">
                    {khatas.map((khata) => (
                        <div
                            key={khata._id}
                            className={`group relative rounded-2xl border ${darkMode ? "border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" : "border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200"} p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-blue-600/60`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`rounded-xl ${darkMode ? "bg-blue-600/15 text-blue-400" : "bg-blue-900/15 text-blue-400"}  p-2`}>
                                        <FileText size={15} />
                                    </div>
                                    <div>
                                        <h3 className={`w-[10em] text-md font-semibold break-all ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                                            {khata.title}
                                        </h3>

                                        <div className={`mt-1 flex items-center gap-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            <CalendarDays size={14} />
                                            <span>{khata.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 pt-2 pr-2 flex items-center flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-pen-to-square text-slate-500" onClick={() => handleSetData({ title: khata.title, date: khata.date, rows: khata.rows, id: khata._id })} />
                                    <i className="fa-solid fa-trash text-red-500" onClick={() => handleDeleteKhata(khata._id)} />
                                </div>

                                <span className={`rounded-full ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-400 text-gray-800"} px-3 py-1 text-xs`}>
                                    <Layers size={12} className="inline mr-1" />
                                    {khata.rows.length}
                                </span>
                            </div>

                            <div className={`my-5 h-px ${darkMode ? "bg-gray-800" : "bg-gray-400"}`} />

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-800"} uppercase`}>Total</p>
                                    <p className={`text-2xl font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                                        ₹ {getTotal(khata.rows)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setActiveKhata(khata)}
                                    className={`rounded-xl ${darkMode ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white" : "bg-blue-950/10 text-blue-500 hover:bg-blue-400 hover:text-white"} px-4 py-2 text-sm transition`}
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {khatas.length === 0 && (
                    <p className={`mt-8 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-800"}`}>
                        No khata ledgers found
                    </p>
                )}
            </div>

            {/* ===== MODAL ===== */}
            {activeKhata && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center ${darkMode ? "bg-black/60" : "bg-white/60"} backdrop-blur-sm`}>
                    <div className={`relative w-full max-w-3xl rounded-2xl ${darkMode ? "bg-gray-900 border-gray-800" : "bg-gray-300 border-gray-200"} border p-6 shadow-2xl`}>

                        {/* Close */}
                        <button
                            onClick={() => setActiveKhata(null)}
                            className={`absolute top-4 right-4 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
                        >
                            <X />
                        </button>

                        {/* Header */}
                        <div>
                            <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                                {activeKhata.title}
                            </h2>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{activeKhata.date}</p>
                        </div>

                        {/* Items */}
                        <div className="mt-6 max-h-[60vh] overflow-y-auto space-y-3">
                            {activeKhata.rows.map((row, i) => (
                                <div
                                    key={i}
                                    className={`flex justify-between items-start rounded-lg ${darkMode ? "bg-gray-800/60" : "bg-gray-500/60"} p-3`}
                                >
                                    <div>
                                        <p className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                            {row.description}
                                        </p>
                                    </div>
                                    <p className={`font-semibold ${darkMode ? "text-green-400" : "text-green-700"}`}>
                                        ₹ {row.amount}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-5 flex justify-between border-t border-gray-800 pt-4">
                            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-700"}`}>
                                {activeKhata.rows.length} items
                            </span>
                            <span className={`text-lg font-bold ${darkMode ? "text-green-400" : "text-green-700"}`}>
                                ₹ {getTotal(activeKhata.rows)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {
                confirm.open && (<DeleteModal />)
            }
        </>
    );
};

export default KhataPreview;
