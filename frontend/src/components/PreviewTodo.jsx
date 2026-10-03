import React, { useContext, useEffect, useRef, useState } from "react";
import TodoContext from "../context/TodoContext";
import DeleteModal from "./DeleteModal";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { addMonths } from "date-fns";

const PreviewTodo = () => {
    /* ===================== STATUS STYLES ===================== */
    const STATUS_STYLES = {
        "in-progress": "bg-blue-100 text-blue-700",
        completed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    };

    const STATUS_STYLES_EVENTS = {
        "in-progress": "text-gray-500",
        completed: "text-green-700",
        cancelled: "text-red-700",
    };

    const { fetchTodo, todoData, setTodoData, callToast, BACKEND_URL, darkMode, confirm, openConfirm } = useContext(TodoContext);
    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("23:59");
    const [description, setDescription] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventId, setEventId] = useState("");
    const [todoId, setTodoId] = useState("");
    const [isUpdate, setIsUpdate] = useState(false);
    const [updateNameDateModal, setUpdateNameDateModal] = useState(false);
    const [eventUpdateForm, setEventUpdateForm] = useState({ eventName: "", date: "" });

    const calendarRef = useRef(null);

    const today = new Date();
    const [selected, setSelected] = useState();
    const [month, setMonth] = useState(addMonths(today, 1));
    const [showCal, setShowCal] = useState(false);

    const goToToday = () => {
        const today = new Date();

        setMonth(today);       // move calendar view to current month
        setSelected(today);    // select today's date

        const formattedDate = today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        setEventUpdateForm((prev) => ({
            ...prev,
            date: formattedDate,
        }));

        setShowCal(false); // close calendar
    };

    const date = selected ? selected?.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }) : "";

    const handleStatusChange = (todoId, status) => {
        setTodoData(prev =>
            prev.map(event => ({
                ...event,
                todoContent: event.todoContent.map(todo =>
                    todo._id === todoId ? { ...todo, status } : todo
                )
            }))
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setEventUpdateForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const addTodoForm = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${BACKEND_URL}/todo/addTodoForm/${eventId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startTime, endTime, description, status: "in-progress" }),
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setEventId("");
                setDescription("");
                setStartTime("00:00");
                setEndTime("23:59");
                setIsModalOpen(false);
                await fetchTodo();
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            callToast("error", error);
            console.log("Todo Update Error", error);
        }
    }

    const updateStatus = async (eventItemId, todoId, todoStatus) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/todo/updateStatus/${eventItemId}/${todoId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status: todoStatus }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
            }
            else {
                callToast("error", data.message);
            }
        } catch (error) {
            console.error(error);
            callToast("error", "Status update failed");
        }
    };

    const updateTodo = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `${BACKEND_URL}/todo/updateTodo/${eventId}/${todoId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ startTime, endTime, description }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setDescription("");
                setEventId("");
                setTodoId("");
                setIsUpdate(false);
                setStartTime("00:00");
                setEndTime("23:59");
                setIsModalOpen(false);
                await fetchTodo();
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            console.error(error);
            callToast("error", "Todo update failed");
        }
    }

    const handleEventUpdateForm = async (e) => {
        e.preventDefault();

        if (!eventUpdateForm.eventName || eventUpdateForm.eventName.length === 0) {
            return callToast("info", "Eventname is required");
        }

        if (eventUpdateForm.eventName.length <= 3) {
            return callToast("info", "Eventname should be greater than 3words");
        }

        try {
            const response = await fetch(
                `${BACKEND_URL}/todo/updateeventUpdateForm/${eventId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(eventUpdateForm),
                }
            );

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setEventUpdateForm({ eventName: "", date: "" });
                setEventId("");
                setUpdateNameDateModal(false);
                await fetchTodo();
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            console.error(error);
            callToast("error", "Event Name update failed");
        }
    }

    /* ===================== DELETE TODO (CONFIRMED) ===================== */
    const handleTodoDelete = (eventItemId, todoId) => {
        openConfirm({
            title: "Delete Todo",
            message: "Are you sure you want to delete this item?",
            onConfirm: async () => {
                try {
                    const response = await fetch(
                        `${BACKEND_URL}/todo/todoDelete/${eventItemId}/${todoId}`,
                        {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                        }
                    );

                    const data = await response.json();

                    if (response.ok) {
                        await fetchTodo();
                        callToast("success", data.message);
                    } else {
                        callToast("error", data.message);
                    }
                } catch {
                    callToast("error", "Todo delete failed");
                }
            },
        });
    };

    /* ===================== DELETE EVENT (CONFIRMED) ===================== */
    const handleEventDelete = (id) => {
        openConfirm({
            title: "Delete Event",
            message: "This will delete the event and all its todos. Continue?",
            onConfirm: async () => {
                try {
                    const response = await fetch(
                        `${BACKEND_URL}/todo/eventDelete/${id}`,
                        {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                        }
                    );

                    const data = await response.json();

                    if (response.ok) {
                        callToast("success", data.message);
                        await fetchTodo();
                    } else {
                        callToast("error", data.message);
                    }
                } catch {
                    callToast("error", "Event delete failed");
                }
            },
        });
    };

    useEffect(() => {
        setSelected(today);
        setMonth(today);
    }, []);

    useEffect(() => {
        fetchTodo();
    }, [])

    return (
        <section className="w-full pb-20 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {todoData.map((item) => (
                <div
                    key={item._id}
                    className={`${darkMode ? "bg-gray-800 border-gray-500" : "bg-gray-200 border-gray-500"} border rounded-2xl shadow-lg max-w-6xl p-6 h-fit`}
                >

                    {/* HEADER */}
                    <div className="flex flex-col items-center gap-3 mb-8">
                        <div className="relative w-full flex justify-center items-center py-2">
                            {/* Event Name */}
                            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} text-center`}>
                                {item.eventName}
                            </h2>

                            <div className="flex justify-center items-center gap-5 absolute -top-2 right-0">
                                <i className="fa-solid fa-edit text-gray-800 dark:text-gray-200  hover:text-gray-400 cursor-pointer"
                                    onClick={() => {
                                        const parsedDate = new Date(item.date);

                                        setUpdateNameDateModal(true);

                                        setEventUpdateForm({
                                            eventName: item.eventName,
                                            date: item.date,
                                        });

                                        setSelected(parsedDate);
                                        setMonth(parsedDate);

                                        setEventId(item._id);
                                    }}></i>
                                {/* Trash Icon */}
                                <i
                                    className="fa-solid fa-trash text-red-600 hover:text-red-800 cursor-pointer"
                                    onClick={() => handleEventDelete(item._id)}
                                ></i>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-full shadow-md">
                            <span className="font-semibold text-sm">
                                {item.date.split(",")[0]}
                            </span>
                            <span className="opacity-80 text-xs">
                                {item.date.split(", ").slice(1).join(", ")}
                            </span>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className={`overflow-x-auto rounded-xl border ${darkMode ? "border-gray-700" : "border-gray-400"}`} >
                        <table className="w-full min-w-[600px]">
                            <thead className={`${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                                <tr>
                                    {["Time", "Description", "Status", "Action"].map((h) => (
                                        <th
                                            key={h}
                                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-400"}`}>
                                {item.todoContent.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-10 text-center text-gray-400">
                                            No todos yet. Click below to add one 🚀
                                        </td>
                                    </tr>
                                ) : (
                                    item.todoContent.map((todo) => (
                                        <tr
                                            key={todo._id}
                                            className={`${darkMode ? "hover:bg-gray-900" : "hover:bg-gray-50"} transition`}
                                        >
                                            {/* TIME */}
                                            <td className={`px-4 py-3 text-sm ${STATUS_STYLES_EVENTS[todo.status]}`}>
                                                {todo.startTime} – {todo.endTime}
                                            </td>

                                            {/* DESCRIPTION */}
                                            <td
                                                className={`px-4 py-3 text-sm font-medium break-all max-w-[350px] ${STATUS_STYLES_EVENTS[todo.status]}`}
                                            >
                                                {todo.description}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={todo.status}
                                                    onChange={(e) => {
                                                        handleStatusChange(todo._id, e.target.value);
                                                        updateStatus(item._id, todo._id, e.target.value);
                                                    }}
                                                    className={`pr-7 px-3 py-1 text-xs font-semibold rounded-full cursor-pointer focus:outline-none ${STATUS_STYLES[todo.status]}`}
                                                >
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-4 py-3 flex justify-center gap-4">
                                                <button
                                                    title="Edit"
                                                    className="text-indigo-600 hover:text-indigo-800 transition"
                                                    onClick={() => {
                                                        setIsModalOpen(true);
                                                        setStartTime(todo.startTime);
                                                        setEndTime(todo.endTime);
                                                        setDescription(todo.description);
                                                        setIsUpdate(true);
                                                        setEventId(item._id);
                                                        setTodoId(todo._id);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>

                                                <button
                                                    title="Delete"
                                                    className="text-red-600 hover:text-red-800 transition"
                                                    onClick={() => handleTodoDelete(item._id, todo._id)}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div >

                    {/* ADD TODO BUTTON */}
                    <div className="flex justify-center mt-6" >
                        <button
                            className={`inline-flex items-center gap-2 ${darkMode ? "bg-blue-500 text-white" : "bg-blue-400 text-white"} hover:bg-blue-700 text-sm font-medium px-6 py-2.5 rounded-lg shadow`}
                            onClick={() => {
                                setIsModalOpen(true);
                                setEventId(item._id);
                            }}
                        >
                            <i className="fa-solid fa-plus"></i>
                            Add Todo
                        </button>
                    </div>

                    {/* MODAL */}
                    <div
                        className={`${isModalOpen ? "" : "hidden"} fixed inset-0 z-50 flex items-center justify-center bg-black/40 preview-2`}
                    >
                        <div className={`${darkMode ? "bg-gray-800" : "bg-gray-200"} rounded-xl shadow-xl w-full max-w-2xl p-6`}>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    {isUpdate ? "Update Todo" : "Add Todo"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setIsUpdate(false);
                                        setDescription("");
                                    }}
                                    className={`${darkMode ? "text-gray-200" : "text-gray-600"} hover:text-gray-700`}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={(e) => (isUpdate ? updateTodo(e) : addTodoForm(e))}>
                                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                                    <div>
                                        <label className={`block mb-2 text-sm font-medium text-heading ${darkMode ? "text-gray-200" : "text-gray-800"}`}> Start time: </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                <i className={`fa-regular fa-clock text-sm ${darkMode ? "text-white" : "text-gray-900"}`}></i>
                                            </div>
                                            <input type="time" value={startTime} min="00:00" max="23:59" onChange={(e) => setStartTime(e.target.value)} required className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} border text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 d`} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block mb-2 text-sm font-medium text-heading ${darkMode ? "text-gray-200" : "text-gray-800"}`}> End time: </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                <i className={`fa-regular fa-clock text-sm ${darkMode ? "text-white" : "text-gray-900"}`}></i>
                                            </div>
                                            <input type="time" value={endTime} min={startTime} max="23:59" onChange={(e) => setEndTime(e.target.value)} required className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} border text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 d`} />
                                        </div>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="sm:col-span-2">
                                    <label className={`block mb-2 text-sm font-medium text-heading ${darkMode ? "text-gray-200" : "text-gray-800"}`}> Description of Schedule: </label>
                                    <textarea rows="2" placeholder="Your description here" className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "text-gray-900 bg-gray-50 border-gray-300"} block p-2.5 w-full text-sm rounded-lg border focus:ring-blue-500 focus:border-blue-500 `} value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>

                                {/* UPDATE */}
                                <div className="flex items-center justify-center sm:col-span-2">
                                    <button type="submit" className={`px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium rounded-lg hover:bg-blue-800 ${darkMode ? "bg-blue-500 text-white" : "bg-blue-400 text-white"}`} >
                                        {isUpdate === true ? "Update Todo" : "Add Todo"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div
                        className={`${updateNameDateModal ? "" : "hidden"} fixed inset-0 z-50 flex items-center justify-center bg-black/40 preview-2`}
                    >
                        <div className={`${darkMode ? "bg-gray-800" : "bg-gray-200"} rounded-xl shadow-xl w-full max-w-xl p-6`}>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    Update Event Name & Date
                                </h3>
                                <button
                                    onClick={() => {
                                        setUpdateNameDateModal(false);
                                        setEventUpdateForm({ eventName: "", date: "" });
                                        setEventId("");
                                        setShowCal(false);
                                        goToToday();
                                    }}
                                    className={`${darkMode ? "text-gray-200" : "text-gray-600"} hover:text-gray-700`}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={(e) => handleEventUpdateForm(e)}>

                                {/* Event Name */}
                                <div className="sm:col-span-2">
                                    <label className={`block mb-2 text-sm font-medium text-heading ${darkMode ? "text-gray-200" : "text-gray-800"}`}> Event Name: </label>
                                    <input name="eventName" type="text" rows="2" placeholder="Enter your Event Name" className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "text-gray-900 bg-gray-50 border-gray-300"} block p-2.5 w-full text-sm rounded-lg border focus:ring-blue-500 focus:border-blue-500 `} value={eventUpdateForm.eventName} onChange={handleChange} />
                                </div>

                                {/* Date */}
                                <div className="sm:col-span-2 mt-2">
                                    <label className={`block mb-2 text-sm font-medium text-heading ${darkMode ? "text-gray-200" : "text-gray-800"}`}> Date: </label>
                                    <input
                                        readOnly
                                        value={eventUpdateForm.date || selected?.toLocaleDateString() || ""}
                                        onClick={() => {
                                            setShowCal((prev) => !prev);
                                        }}
                                        placeholder="Pick a date"
                                        className={`w-full cursor-pointer rounded-lg border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 caret-transparent`}
                                    />
                                </div>
                                {/* UPDATE */}
                                <div className="flex items-center justify-center sm:col-span-2">
                                    <button type="submit" className={`px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium rounded-lg hover:bg-blue-800 ${darkMode ? "bg-blue-500 text-white" : "bg-blue-400 text-white"}`} >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>

                        {showCal && (
                            <div ref={calendarRef} className={`absolute z-20 flex items-center justify-center w-fit h-fit rounded-xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} p-3 shadow-xl`}>
                                <div className="flex flex-col">
                                    <DayPicker
                                        mode="single"
                                        month={month}
                                        className={`${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white text-gray-900"}`}
                                        onMonthChange={setMonth}
                                        selected={selected}
                                        onSelect={(date) => {
                                            if (!date) return;

                                            setSelected(date);

                                            const formattedDate = date.toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            });

                                            setEventUpdateForm((prev) => ({
                                                ...prev,
                                                date: formattedDate,
                                            }));

                                            setShowCal(false);
                                        }}
                                    />

                                    <div className="mt-2 flex justify-end gap-7">
                                        <button
                                            type="button"
                                            onClick={goToToday}
                                            className="text-xs font-medium px-3 py-1 rounded-full 
                                                    bg-blue-100 text-blue-700 hover:bg-blue-200 
                                                    dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition"
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCal(false);
                                            }}
                                            className="text-xs font-medium px-3 py-1 rounded-full 
                                                    bg-red-100 text-red-700 hover:bg-red-200 
                                                    dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div >
            ))}

            {/* ===================== CONFIRM MODAL UI ===================== */}
            {
                confirm.open && (<DeleteModal />)
            }
        </section >

    );
};

export default PreviewTodo;
