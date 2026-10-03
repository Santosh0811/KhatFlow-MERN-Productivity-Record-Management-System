import React, { useContext, useState, useEffect, useRef } from "react";
import TodoContext from "../context/TodoContext";
import KhataPreview from "./KhataPreview";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { addMonths } from "date-fns";

const KhataNote = () => {
  const { BACKEND_URL, callToast, fetchKhatas, isLogin, darkMode, useTitle, navigate } = useContext(TodoContext);
  const [title, setTitle] = useState("");
  const [khataId, setKhataId] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [rows, setRows] = useState([{ description: "", amount: "" }]);
  const calendarRef = useRef(null);

  useTitle("Khata");
  const today = new Date();
  const [selected, setSelected] = useState();
  const [month, setMonth] = useState(addMonths(today, 1));
  const [showCal, setShowCal] = useState(false);
  const [date, setDate] = useState(
    today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const goToToday = () => {
    const today = new Date();

    setMonth(today);
    setSelected(today);

    setDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    setShowCal(false);
  };

  const handleKhataUpdate = async (e) => {
    e.preventDefault();

    const filteredRows = rows.filter((row) => row.description.trim() !== "" || row.amount !== "");

    const hasInvalidRow = filteredRows.some((row) => row.description.trim() === "" || row.amount === "");

    if (hasInvalidRow) {
      callToast("error", "Please fill all row fields");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/khata/updateKhataLedger/${khataId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, rows: filteredRows }),
        credentials: "include"
      })

      const data = await response.json();

      if (response.ok) {
        callToast("success", data.message);
        setTitle("");
        const today = new Date();

        setSelected(today);
        setMonth(today);

        setDate(
          today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        setRows([
          { description: "", amount: "" },
        ]);
        setKhataId("");
        setIsUpdate(false);
        await fetchKhatas();
      }
      else {
        callToast("error", data.message);
      }

    } catch (error) {
      console.log(error);
    }
  }

  const handleChange = (index, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row, i) =>
        i === index
          ? {
            ...row,
            [field]:
              field === "amount"
                ? value.replace(/[^0-9.-]/g, "")
                : value,
          }
          : row
      )
    );
  };

  const addRow = () => {
    setRows([
      ...rows,
      { description: "", amount: "" },
    ]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const totalAmount = rows.reduce((sum, row) => {
    const amount = parseFloat(row.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const handleSubmitLedger = async (e) => {
    e.preventDefault();

    const filteredRows = rows.filter((row) => row.description.trim() !== "" || row.amount !== "");

    const hasInvalidRow = filteredRows.some((row) => row.description.trim() === "" || row.amount === "" || row.amount === "-" || row.amount === ".");

    if (hasInvalidRow) {
      callToast("error", "Please fill all row fields");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/khata/saveKhataLedger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, rows: filteredRows }),
        credentials: "include"
      })

      const data = await response.json();

      if (response.ok) {
        callToast("success", data.message);

        const today = new Date();

        setTitle("");
        setSelected(today);
        setMonth(today);

        setDate(
          today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );

        setRows([{ description: "", amount: "" }]);

        await fetchKhatas();
      }
      else {
        callToast("error", data.message);
      }

    } catch (error) {
      console.log(error);
    }
  }

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
    if (!isLogin) {
      navigate("/login", { replace: true });
    }
  }, [isLogin]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? "from-gray-950 via-gray-900 to-gray-800" : "from-gray-200 via-gray-100 to-gray-300"} flex items-center justify-center flex-col p-6`}>
      <div className={`w-full max-w-4xl rounded-2xl ${darkMode ? "bg-gray-900 shadow-2xl border border-gray-800" : "bg-gray-100 shadow-2xl border border-gray-200"}`}>

        {/* Header */}
        <div className={`px-8 py-6 ${darkMode ? "border-gray-800" : "border-gray-200"} flex flex-col lg:flex-row gap-2 lg:gap-0 items-center justify-between`}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full text-xl font-semibold bg-transparent outline-none ${darkMode ? "text-gray-100" : "text-gray-800"}`}
            placeholder="Enter Khata name"
          />

          <div className="relative flex items-center justify-center">
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
              onClick={() => setShowCal((prev) => !prev)}
              placeholder="Pick a date"
              className={`w-fit px-1 py-1 text-center appearance-none bg-transparent border border-t-0 border-r-0 border-l-0 rounded-xl outline-none text-sm ${darkMode ? "text-gray-400" : "text-gray-800"
                }`}
            />

            {showCal && (
              <div ref={calendarRef} className={`absolute top-8 z-20 flex items-center justify-center w-fit h-fit rounded-xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} p-3 shadow-xl`}>
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

                      setDate(
                        date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      );

                      setShowCal(false);
                    }}
                  />

                  <div className="mt-2 flex justify-end gap-7">
                    <button
                      type="button"
                      onClick={goToToday}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition">
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCal(false);
                      }}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Head */}
        <div className="px-8 py-3 bg-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-400 grid grid-cols-8">
          <div className="col-span-1">#</div>
          <div className="col-span-6 flex items-center justify-between w-full gap-2">
            <div className="w-3/4 text-center">Description</div>
            <div className="w-1/4 text-center">Amount (₹)</div>
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        <div className={`px-8 ${darkMode ? "divide-gray-800" : "divide-gray-100"}`}>
          {rows.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-8 py-3 items-center group ${darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-200/50"} rounded-lg transition`}
            >
              <div className={`col-span-1 text-sm ${darkMode ? "text-gray-500" : "text-gray-800"}`}>
                {index + 1}
              </div>

              <div className="col-span-6 flex items-center justify-between w-full gap-2">
                <input
                  value={row.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  className={`w-3/4 px-2 py-0 bg-transparent border border-t-0 border-r-0 border-l-0 rounded-lg outline-none ${darkMode ? "text-gray-200 border-gray-200" : "text-gray-800 border-gray-800"}`}
                />

                <input
                  type="text"
                  inputMode="numeric"
                  value={row.amount}
                  onChange={(e) =>
                    handleChange(index, "amount", e.target.value)
                  }
                  className={`w-1/4 px-2 py-0 text-right bg-transparent border border-t-0 border-r-0 border-l-0 rounded-lg outline-none ${darkMode ? "text-gray-200 border-gray-200" : "text-gray-800 border-gray-800"}`}
                />
              </div>

              <button
                onClick={() => removeRow(index)}
                className="col-span-1 text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <div className={`flex justify-center items-center group h-12 ${darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-300/50"} rounded-lg transition`}>
            <button
              onClick={addRow}
              className="px-10 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-800 flex justify-between items-center">
          <div className="flex flex-row gap-3">
            <button
              onClick={(e) => {
                isUpdate ? handleKhataUpdate(e) : handleSubmitLedger(e)
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md"
            >
              {isUpdate ? "Update" : "Save"}
            </button>
            <button
              onClick={() => {
                const today = new Date();

                setSelected(today);
                setMonth(today);

                setDate(
                  today.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                );

                setIsUpdate(false);
                setKhataId("");
                setTitle("");
                setRows([{ description: "", amount: "" }]);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md"
            >
              Reset
            </button>
          </div>

          <div className="text-right">
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-800"} uppercase tracking-wider`}>
              Total Amount
            </p>
            <p className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              ₹ {totalAmount}
            </p>
          </div>
        </div>

      </div>

      <KhataPreview
        setTitle={setTitle}
        setDate={setDate}
        setSelected={setSelected}
        setMonth={setMonth}
        setRows={setRows}
        setKhataId={setKhataId}
        setIsUpdate={setIsUpdate}
      />
    </div>
  );
};

export default KhataNote;
