import React, { useContext, useEffect, useState } from "react";
import TodoContext from "../context/TodoContext";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteModal";

const CustomerCards = () => {
    const { customers, setCustomers, BACKEND_URL, callToast, isLogin, useTitle, darkMode, confirm, openConfirm, navigate } = useContext(TodoContext);
    const [newCustomer, setNewCustomer] = useState("");

    useTitle("Account");

    const addCustomer = async () => {
        if (!newCustomer.trim()) return;

        try {
            const response = await fetch(`${BACKEND_URL}/account/createCustomer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCustomer }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setNewCustomer("");
                await fetchCustomers();
                navigate(`/account/${data.data._id}`, { replace: true });
            } else {
                callToast("error", data.message);
            }

        } catch (error) {
            console.error(error);
            callToast("error", "Server error. Please try again.");
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/account/fetchCustomers`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                setCustomers(data.data);
            }
            else {
                callToast("error", data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleAccountPage = (customerId) => {
        navigate(`/account/${customerId}`, { replace: true });
    };

    const handleCustomerDelete = async (id, name) => {
        openConfirm({
            title: `Delete ${name} Account`,
            message: "Are you sure you want to delete this Account?",
            onConfirm: async () => {

                try {
                    const response = await fetch(
                        `${BACKEND_URL}/account/deleteCustomer/${id}`,
                        {
                            method: "DELETE",
                            credentials: "include",
                        }
                    );

                    const data = await response.json();

                    if (response.ok) {
                        callToast("success", data.message);
                        fetchCustomers();
                    } else {
                        callToast("error", data.message);
                    }
                } catch (error) {
                    console.error(error);
                    callToast("error", "Something went wrong");
                }
            }
        })
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (!isLogin) {
            navigate("/login", { replace: true });
        }
    }, [isLogin]);

    return (
        <div className={`min-h-screen ${darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100" : "bg-gradient-to-br from-slate-300 via-slate-100 to-white text-slate-800"} p-6`}>

            <h1 className="text-2xl font-semibold mb-6">Customers</h1>

            {/* CUSTOMER CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

                {customers.map((c) => (
                    <div
                        type="button"
                        key={c._id}
                        className={`relative cursor-pointer ${darkMode ? "bg-slate-900/60 border-slate-600" : "bg-slate-200/60 border-slate-500"} border rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/10 hover:shadow-xl transition flex items-center justify-center flex-col`}
                        onClick={() => handleAccountPage(c._id)}
                    >
                        <h2 className="text-lg font-semibold text-center">{c.name}</h2>
                        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-800"} mt-1`}>
                            Tap to open ledger
                        </p>
                        <div className="absolute top-3 right-3 flex gap-4">
                            <button
                                title="Delete"
                                className="text-red-600 hover:text-red-800 transition"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCustomerDelete(c._id, c.name);
                                }
                                }
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))
                }

                {/* ADD CUSTOMER CARD */}
                <div className={`${darkMode ? "bg-slate-900/60 border-slate-600" : "bg-slate-200/60 border-slate-500"} border border-dashed rounded-2xl p-6 flex flex-col justify-between`}>

                    <input
                        placeholder="Customer name"
                        value={newCustomer}
                        onChange={(e) => setNewCustomer(e.target.value)}
                        className={`${darkMode ? "border-slate-600 text-slate-200" : "border-slate-700 text-slate-800"} bg-transparent border-b outline-none pb-1 mb-4`}
                    />

                    <button
                        onClick={addCustomer}
                        className={`${darkMode ? "bg-emerald-600 hover:bg-emerald-700 text-slate-200" : "bg-emerald-300 hover:bg-emerald-400 text-slate-800"} py-2 rounded-xl font-medium`}
                    >
                        Add Customer
                    </button>
                </div>
            </div >

            {
                confirm.open && (<DeleteModal />)
            }
        </div >
    );
};

export default CustomerCards;
