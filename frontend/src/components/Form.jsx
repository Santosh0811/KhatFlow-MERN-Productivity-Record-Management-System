import React, { useContext, useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { addMonths } from "date-fns";
import PreviewTodo from "./PreviewTodo";
import TodoContext from "../context/TodoContext";

const Form = () => {
    const { BACKEND_URL, callToast, isLogin, fetchTodo, useTitle, darkMode, resetTimer, navigate } = useContext(TodoContext);

    const calendarRef = useRef(null);

    useTitle("Todo-Events")

    const [eventName, setEventName] = useState("");

    const today = new Date();
    const [selected, setSelected] = useState();
    const [month, setMonth] = useState(addMonths(today, 1));
    const [showCal, setShowCal] = useState(false);

    const goToToday = () => {
        const today = new Date();

        setMonth(today);
        setSelected(today);
        setShowCal(false);
    };

    const date = selected ? selected?.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }) : "";

    const handleTodoForm = async (e) => {
        e.preventDefault();

        if(!eventName || eventName.length === 0){
            return callToast("info", "Eventname is required");
        }

        if(eventName.length <= 3){
            return callToast("info", "Eventname should be greater than 3words");
        }

        try {
            const response = await fetch(`${BACKEND_URL}/todo/submitTodoForm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventName, date, startTime: "", endTime: "", description: "", status: "in-progress" }),
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setEventName("");
                await fetchTodo();
            }
            else {
                callToast("error", data.message);
            }
        } catch (error) {
            callToast("error", error);
            console.log("Todo Form Error", error);
        }
    }

    useEffect(() => {
        if (!isLogin) {
            navigate("/login", { replace: true });
        }
    }, [isLogin]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCal(false);
            }
        };

        if (showCal) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCal]);

    useEffect(() => {
        setSelected(today);
        setMonth(today);
    }, []);

    useEffect(() => {
        resetTimer();
    }, [])

    return (
        <div className={`min-h-screen ${darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100" : "bg-gradient-to-br from-slate-300 via-slate-100 to-white text-slate-800"} flex flex-col gap-10 px-6 pt-10`}>
            {/* FORM CARD */}
            <section className="w-full max-w-xl">
                <div className={`${darkMode ? "bg-gray-800 border-gray-500" : "bg-gray-200 border-gray-500"} rounded-2xl shadow-lg border p-6 sm:p-8`}>

                    {/* HEADER */}
                    <div className="mb-6 text-center">
                        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            Create New Todo Event
                        </h2>
                        <p className={`mt-1 text-sm ${darkMode ? "text-gray-500" : "text-gray-700"}`}>
                            Organize your tasks with a scheduled event
                        </p>
                    </div>

                    <form onSubmit={handleTodoForm}>
                        <div className="space-y-6">

                            {/* EVENT NAME */}
                            <div>
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Event Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Project Planning"
                                    required
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    className={`w-full rounded-lg border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                                />
                            </div>

                            {/* DATE PICKER */}
                            <div className="relative">
                                <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Select Date
                                </label>

                                <input
                                    readOnly
                                    value={
                                        selected
                                            ? selected.toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : ""
                                    }
                                    onClick={() => {
                                        setShowCal((prev) => !prev);
                                    }}
                                    placeholder="Pick a date"
                                    className={`w-full cursor-pointer rounded-lg border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-900"} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 caret-transparent`}
                                />

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

                                                    const formattedDate = date.toLocaleDateString("en-US", {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    });

                                                    setSelected(date);
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

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                className={`w-full rounded-lg ${darkMode ? "bg-blue-500 text-white" : "bg-blue-400 text-white"} px-5 py-3 text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                            >
                                Create Event
                            </button>

                        </div>
                    </form>
                </div>
            </section>

            {/* PREVIEW */}
            <PreviewTodo />
        </div>

    );
};

export default Form;
