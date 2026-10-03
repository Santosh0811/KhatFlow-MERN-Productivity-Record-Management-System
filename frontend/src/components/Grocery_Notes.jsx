import React, { useContext, useEffect, useState } from "react";
import TodoContext from "../context/TodoContext";
import DeleteModal from "./DeleteModal";
import { Plus, Trash2, X, Pencil, Calculator, Receipt, Minus, Save, ShoppingCart, Package, IndianRupee, FileText } from "lucide-react";

const Grocery_Notes = () => {
    const { darkMode, BACKEND_URL, callToast, openConfirm, confirm, useTitle, navigate, isLogin } = useContext(TodoContext);

    useTitle("Grocery");

    const [title, setTitle] = useState("");
    const [items, setItems] = useState([]);
    const [notes, setNotes] = useState([]);
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const [unitName, setUnitName] = useState("g");
    const [rate, setRate] = useState("");
    const [isUpdateModal, setIsUpdateModal] = useState(false);
    const [updateItems, setUpdateItems] = useState([]);
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateId, setUpdateId] = useState("");

    const diaryBg = darkMode ? "#1e1e2f" : "#fffdf2";
    const lineColor = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,255,0.15)";
    const textColor = darkMode ? "#f5f5f5" : "#1c1c1c";

    const [qty, setQty] = useState(1);

    const increment = () => setQty(qty + 1);
    const decrement = () => {
        if (qty > 1) setQty(qty - 1);
    };

    const addItem = () => {
        if (!name.trim() || !qty) {
            return callToast("info", "All inputs required");
        }
        const newItem = {
            id: Date.now(),
            name,
            qty: Number(qty),
            unit,
            unitName,
            rate: rate === "" ? 0 : Number(rate),
        };
        setItems((prev) => [...prev, newItem]);
        setName(""); setQty(1); setUnit(""); setRate(""); setUnitName("g");
    };

    const removeItem = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const grandTotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

    const handleUpdateItem = (index, name, value) => {
        setUpdateItems((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [name]: value
            };
            return updated;
        });
    };

    const cleanItems = (items) => items.map(({ tempId, ...rest }) => rest);

    const addNewItem = () => {
        setUpdateItems((prev) => [
            ...prev,
            {
                tempId: Date.now(),
                name: "",
                unit: "",
                unitName: "g",
                qty: 1,
                rate: ""
            }
        ]);
    };

    const setEditData = ({ note }) => {
        setIsUpdateModal(true);
        setUpdateItems(note.items);
        setUpdateTitle(note.title);
        setUpdateId(note._id);
    };

    const handleDelete = async ({ id, title }) => {
        openConfirm({
            title: `Delete ${title} Grocery Note)`,
            message: "Are you sure you want to delete this Account?",
            onConfirm: async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/grocery/deleteGroceryNote/${id}`, {
                        method: "DELETE",
                        credentials: "include"
                    })

                    const data = await response.json();

                    if (response.ok) {
                        callToast("success", data.message);
                        await fetchGroceryNote();
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

    const updateGroceryNote = async () => {
        try {
            const invalidItem = updateItems.find(
                (item) =>
                    !item.name?.trim() ||
                    !item.unit ||
                    item.rate <= 0
            );

            if (!updateTitle.trim() || updateItems.length === 0 || invalidItem) {
                return callToast("info", "All inputs required");
            }

            const total = updateItems.reduce((sum, item) => sum + item.qty * item.rate, 0);

            const response = await fetch(`${BACKEND_URL}/grocery/updateGroceryNote/${updateId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updateTitle, items: cleanItems(updateItems), total }),
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setUpdateId("");
                setUpdateTitle("");
                setUpdateItems([]);
                setIsUpdateModal(false);
                await fetchGroceryNote();
            }
            else {
                callToast("error", data.message);
            }
        } catch (error) {
            console.log(error);
        }

    };

    const saveGroceryNote = async () => {

        try {
            if (!title.trim() || items.length === 0) {
                return callToast("info", "All inputs required");
            }

            const total = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

            const response = await fetch(`${BACKEND_URL}/grocery/saveGroceryNote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, items, total }),
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setTitle("");
                setItems([]);
                setName("");
                setQty(1);
                setUnit("");
                setRate("");
                setUnitName("g");
                await fetchGroceryNote();
            }
            else {
                callToast("error", data.message);
            }
        } catch (error) {
            console.log(error);
        }

    };

    const fetchGroceryNote = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/grocery/fetchGroceryNotes`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                setNotes(data.GroceryNotes);
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchGroceryNote();
    }, [])

     useEffect(() => {
        if (!isLogin) {
            navigate("/login", { replace: true });
        }
    }, [isLogin]);

    return (
        <div className={`min-h-screen p-4 ${darkMode ? "bg-slate-900 text-white" : "bg-slate-200 text-black"} flex flex-col items-center gap-8`}>

            {/* Current Note */}
            <div className={`relative w-full max-w-3xl rounded-3xl 
    shadow-2xl border ${darkMode ? "border-white/10 bg-slate-800/60" : "border-gray-200 bg-white"} 
    backdrop-blur-md p-5 transition-all`} style={{ backgroundColor: diaryBg, backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 28px, ${lineColor} 29px)` }}>
                <div className="absolute left-8 top-0 h-full w-[2px] bg-red-400 opacity-60"></div>
                <div className="pl-6 sm:pl-10 py-1 font-serif" style={{ color: textColor }}>
                    <div className="flex items-center gap-2 border-b-2 border-gray-400/40 pb-2">
                        <FileText size={18} className="opacity-70" />
                        <input
                            type="text"
                            placeholder="Enter Grocery Note Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-sm border-0 font-semibold tracking-wide 
    bg-transparent focus:outline-none"
                        />
                    </div>

                    {/* Inputs */}
                    <div className="mt-8 bg-white/5 rounded-2xl p-5 border border-white/10">

                        {/* Scroll Container */}
                        <div className="overflow-x-auto">
                            <div className="gn-1">

                                {/* Header Row */}
                                <div className="grid grid-cols-12 text-xs uppercase tracking-wider opacity-60 mb-3">
                                    <span className="col-span-4 text-center">Item</span>
                                    <span className="col-span-2 text-center">Unit</span>
                                    <span className="col-span-2 text-center">Qty</span>
                                    <span className="col-span-2 text-center">Rate</span>
                                    <span className="col-span-2"></span>
                                </div>

                                {/* Input Row */}
                                <div className="grid grid-cols-12 gap-4 items-center">

                                    {/* Item */}
                                    <div className="col-span-4 flex items-center gap-2 border border-gray-950/30 dark:border-gray-300/30 rounded-xl px-3">
                                        <ShoppingCart size={16} className="opacity-60" />
                                        <input
                                            type="text"
                                            placeholder="Item name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-transparent py-2 border-0 focus:outline-none"
                                        />
                                    </div>

                                    {/* Unit */}
                                    <div className="col-span-2 flex items-center border border-gray-950/30 dark:border-gray-300/30 rounded-xl overflow-hidden">
                                        <input
                                            type="number"
                                            placeholder="Unit"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-1/2 bg-transparent px-2 py-2 border-0 text-right focus:outline-none"
                                        />

                                        <select
                                            value={unitName}
                                            onChange={(e) => setUnitName(e.target.value)}
                                            className={`w-1/2 px-2 py-2 text-left border-0 focus:outline-none ${darkMode ? "bg-slate-800 text-white" : "bg-white text-black"
                                                }`}
                                        >
                                            <option value="pcs">pcs</option>
                                            <option value="kg">Kg</option>
                                            <option value="g">g</option>
                                            <option value="L">L</option>
                                            <option value="ml">ml</option>
                                        </select>
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2 flex items-center justify-center gap-2 border border-gray-950/30 dark:border-gray-300/30 rounded-xl px-2 py-2">

                                        <button
                                            onClick={decrement}
                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition"
                                        >
                                            <Minus size={16} />
                                        </button>

                                        <span className="min-w-[30px] text-center font-semibold">
                                            {qty}
                                        </span>

                                        <button
                                            onClick={increment}
                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition"
                                        >
                                            <Plus size={16} />
                                        </button>

                                    </div>

                                    {/* rate */}
                                    <div className="col-span-2 flex items-center gap-2 border border-gray-950/30 dark:border-gray-300/30 rounded-xl px-3">
                                        <IndianRupee size={16} className="opacity-60" />
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={rate}
                                            onChange={(e) => setRate(e.target.value)}
                                            className="w-full bg-transparent py-2 border-0 text-center focus:outline-none"
                                        />
                                    </div>

                                    {/* Add Button */}
                                    <button
                                        onClick={addItem}
                                        className="col-span-2 w-full px-2 py-2 text-xs bg-gradient-to-r 
          from-green-500 to-emerald-600 
          text-white font-semibold rounded-xl 
          shadow hover:scale-[1.02] active:scale-95 transition"
                                    >
                                        Add Item
                                    </button>

                                </div>

                            </div>
                        </div>

                    </div>

                    {/* Items list */}
                    {items.length > 0 && (
                        <>
                            <div className="grid grid-cols-7 
                text-xs uppercase tracking-wider 
                opacity-70 border-b pb-2 mb-2 mt-2">
                                <span>Sr.</span>
                                <span className="col-span-2">Item</span>
                                <span>Unit</span>
                                <span>Qty</span>
                                <span>Rate</span>
                                <span>Total</span>
                            </div>
                            <div className="space-y-2 text-xs sm:text-base">
                                {items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        onDoubleClick={() => removeItem(item.id)}
                                        className="grid grid-cols-7 items-center 
             py-2 px-2 rounded-lg 
             hover:bg-white/5 transition cursor-pointer"
                                    >
                                        <span>{index + 1}.</span>
                                        <span className="col-span-2">{item.name}</span>
                                        <span>{item.unit}{item.unitName}</span>
                                        <span>{item.qty}</span>
                                        <span>₹{item.rate}</span>
                                        <span className="font-semibold overflow-scroll">₹{(item.qty * item.rate).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t 
                text-lg font-bold 
                flex justify-between items-center">
                                <span className="tracking-wide">Grand Total</span>
                                <span className="flex items-center gap-2 text-green-500 text-xl">
                                    <Calculator size={18} />
                                    ₹{(grandTotal).toFixed(2)}
                                </span>
                            </div>
                        </>
                    )}

                    <p className="text-xs opacity-60 mt-2">Double click item to remove</p>
                    <button
                        onClick={saveGroceryNote}
                        className="mt-6 w-full flex items-center justify-center gap-2
  bg-gradient-to-r from-blue-500 to-indigo-600 
  text-white font-semibold py-3 rounded-xl shadow-lg 
  hover:scale-[1.02] transition"
                    >
                        <Save size={18} />
                        Save Note
                    </button>
                </div>
            </div>

            {/* Saved Notes */}
            <div className="w-full max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <div
                        key={note._id}
                        style={{
                            backgroundColor: diaryBg,
                            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 28px, ${lineColor} 29px)`
                        }}
                        className="relative p-4 pl-7 flex flex-col rounded-lg shadow-lg font-serif overflow-hidden"
                    >

                        {/* Action Icons */}
                        <div className="absolute right-4 top-4 flex gap-3 z-10">

                            <button
                                className="text-blue-500 hover:text-blue-700 transition"
                                onClick={() => {
                                    setEditData({ note });
                                }}
                            >
                                <Pencil size={18} />
                            </button>

                            <button
                                className="text-red-500 hover:text-red-600 transition"
                                onClick={() => {
                                    handleDelete({ id: note._id, title: note.title });
                                }}
                            >
                                <Trash2 size={18} />
                            </button>

                        </div>

                        {/* Left Diary Line */}
                        <div className="absolute left-4 top-0 h-full w-[2px] bg-red-400 opacity-60"></div>

                        {/* Title */}
                        <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Receipt size={18} />
                            {note.title}
                        </h2>

                        {/* Items */}
                        {note.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-between text-sm sm:text-base"
                            >
                                <span className="font-medium">
                                    {index + 1}. {item.name} ({item.unit}
                                    {item.unitName}) × {item.qty}
                                </span>

                                <span className="font-medium pl-10">₹{item.rate}</span>

                                <span className="font-medium pl-10">
                                    ₹{(item.qty * item.rate).toFixed(2)}
                                </span>
                            </div>
                        ))}

                        {/* Total */}
                        <div className="mt-auto border-t pt-1 font-semibold flex justify-between">
                            <span>Total</span>
                            <span className="text-green-600">₹{(note.total).toFixed(2)}</span>
                        </div>

                    </div>
                ))}
            </div>

            {isUpdateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">

                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsUpdateModal(false)}
                    ></div>

                    {/* Modal Wrapper */}
                    <div className="relative flex justify-center min-h-full py-10 px-2">

                        {/* Modal Box */}
                        <div className="relative bg-white dark:bg-slate-800 text-black dark:text-white w-full max-w-3xl p-6 rounded-2xl shadow-2xl flex flex-col min-h-[500px]">

                            {/* Title */}
                            <div className="flex items-center gap-2 pb-2">
                                <FileText size={18} className="opacity-70" />
                                <input
                                    type="text"
                                    placeholder="Enter Grocery Note Title..."
                                    value={updateTitle}
                                    onChange={(e) => setUpdateTitle(e.target.value)}
                                    className="w-full text-lg border-0 font-semibold tracking-wide bg-transparent focus:outline-none"
                                />
                            </div>

                            {/* Table Section */}
                            <div className="border-t-2 border-gray-400/40 overflow-x-auto w-full">

                                <div className="min-w-[35rem]">

                                    {/* Header */}
                                    <div className="grid grid-cols-13 gap-3 items-center text-xs uppercase tracking-wider opacity-70 border-b pt-2 pb-2 mb-3 px-0">
                                        <span className="col-span-1 text-center">Sr.</span>
                                        <span className="col-span-3 text-center">Item</span>
                                        <span className="col-span-2 text-center">Unit</span>
                                        <span className="col-span-2 text-center">Qty</span>
                                        <span className="col-span-2 text-center">Rate</span>
                                        <span className="col-span-2 text-center">Total</span>
                                        <span className="col-span-1 text-center">Act</span>
                                    </div>

                                    {/* Items */}
                                    {updateItems.map((item, index) => (
                                        <div
                                            key={item._id || item.tempId}
                                            className="grid grid-cols-13 gap-3 items-center mb-2"
                                        >

                                            {/* Sr */}
                                            <span className="col-span-1 text-center">
                                                {index + 1}
                                            </span>

                                            {/* Item */}
                                            <input
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(e) =>
                                                    handleUpdateItem(index, "name", e.target.value)
                                                }
                                                className="col-span-3 w-full rounded-xl border border-gray-950/30 dark:border-gray-300/30 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />

                                            {/* Unit */}
                                            <div className="col-span-2 flex items-center border border-gray-950/30 dark:border-gray-300/30 rounded-xl overflow-hidden">

                                                <input
                                                    type="number"
                                                    value={item.unit || ""}
                                                    onChange={(e) =>
                                                        handleUpdateItem(index, "unit", e.target.value)
                                                    }
                                                    className="w-1/2 bg-transparent px-2 py-2 border-0 text-right focus:outline-none"
                                                />

                                                <select
                                                    value={item.unitName}
                                                    onChange={(e) =>
                                                        handleUpdateItem(index, "unitName", e.target.value)
                                                    }
                                                    className={`w-1/2 px-2 py-2 pr-4 text-left border-0 focus:outline-none appearance-none ${darkMode
                                                        ? "bg-slate-800 text-white"
                                                        : "bg-white text-black"
                                                        }`}
                                                >
                                                    <option value="pcs">pcs</option>
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="L">L</option>
                                                    <option value="ml">ml</option>
                                                </select>

                                            </div>

                                            {/* Qty */}
                                            <div className="col-span-2 flex items-center justify-center gap-2 border border-gray-950/30 dark:border-gray-300/30 rounded-xl px-2 py-2">

                                                <button
                                                    onClick={() =>
                                                        handleUpdateItem(
                                                            index,
                                                            "qty",
                                                            item.qty > 1 ? item.qty - 1 : 1
                                                        )
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 active:scale-95 transition"
                                                >
                                                    -
                                                </button>

                                                <span>{item.qty}</span>

                                                <button
                                                    onClick={() =>
                                                        handleUpdateItem(index, "qty", item.qty + 1)
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition"
                                                >
                                                    +
                                                </button>

                                            </div>

                                            {/* Rate */}
                                            <div className="col-span-2 flex items-center gap-2 border border-gray-950/30 dark:border-gray-300/30 rounded-xl px-1">

                                                <IndianRupee size={16} className="opacity-60" />

                                                <input
                                                    type="number"
                                                    value={item.rate ?? ""}
                                                    onChange={(e) =>
                                                        handleUpdateItem(
                                                            index,
                                                            "rate",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-full bg-transparent py-2 border-0 text-center focus:outline-none"
                                                />

                                            </div>

                                            {/* Total */}
                                            <span className="col-span-2 text-center font-semibold">
                                                ₹{(item.qty * item.rate).toFixed(2)}
                                            </span>

                                            {/* Delete */}
                                            <button
                                                onClick={() =>
                                                    setUpdateItems((prev) =>
                                                        prev.filter((_, i) => i !== index)
                                                    )
                                                }
                                                className="col-span-1 flex justify-center items-center text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                        </div>
                                    ))}

                                </div>
                            </div>

                            {/* Add Item */}
                            <div className="flex justify-center items-center mb-2">
                                <button
                                    onClick={addNewItem}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition"
                                >
                                    <Plus size={18} />
                                    Add Item
                                </button>
                            </div>

                            {/* Grand Total */}
                            <div className="mt-auto pt-4 border-t text-lg font-bold flex justify-between items-center">
                                <span className="tracking-wide">Grand Total</span>
                                <span className="flex items-center gap-2 text-green-500 text-xl">
                                    <Calculator size={18} />
                                    ₹{(updateItems.reduce(
                                        (sum, item) => sum + item.qty * item.rate,
                                        0
                                    )).toFixed(2)}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="mt-2 text-lg font-bold flex justify-between items-center">

                                <button
                                    onClick={updateGroceryNote}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white"
                                >
                                    <Pencil size={18} />
                                    Update
                                </button>

                                <button
                                    onClick={() => setIsUpdateModal(false)}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white"
                                >
                                    <X size={18} />
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            )}

            {
                confirm.open && (<DeleteModal />)
            }
        </div >
    );
};

export default Grocery_Notes;