import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TodoContext from '../context/TodoContext';
import { Moon } from 'lucide-react';
import { Sun } from 'lucide-react';

const Navbar = () => {
    const { userData, handleLogout, isLogin, toggleDarkMode, darkMode, toggleTheme, isDark, setDarkMode, BACKEND_URL, callToast, navigate } = useContext(TodoContext);
    const [userDataDrawer, setUserDataDrawer] = useState(false);
    const [isChangePass, setIsChangePass] = useState(false);
    const [isPassCorrect, setIsPassCorrect] = useState(false);
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);

    const navLinks = [
        { to: "/form", label: "Add Todo" },
        { to: "/khatanote", label: "Add Khata Note" },
        { to: "/customer", label: "Add Account" },
        { to: "/groceryNote", label: "Add Grocery Note" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const checkCurrentPassword = async (e) => {
        e.preventDefault();
        if (!form.currentPassword) return callToast("info", "Enter current password");

        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/auth/checkCurrentPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: form.currentPassword }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                setIsPassCorrect(true);
                callToast("success", data.message);
            } else {
                setIsPassCorrect(false);
                callToast("error", data.message);
            }
        } catch (err) {
            callToast("error", "Current Password Error");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            return callToast("info", "Passwords do not match");
        }

        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/auth/changePassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: form.newPassword }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setIsChangePass(false);
                setIsPassCorrect(false);
                setForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                callToast("error", data.message);
            }
        } catch (err) {
            callToast("error", "Change Password error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
            setDarkMode(true);
        } else {
            document.documentElement.classList.remove("dark");
            setDarkMode(false);
        }
    }, [isDark, setDarkMode]);

    useEffect(() => {
        if (!userDataDrawer) {
            setIsChangePass(false);
            setIsPassCorrect(false);
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        }
    }, [userDataDrawer]);


    return (
        <header className={`w-full shadow-md sticky top-0 z-20 transition-colors ${darkMode
            ? 'bg-slate-950 text-white shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
            : 'bg-slate-200 text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.15)]'}`}>

            {/* Desktop Menu */}
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 nav-1 h-[10vh]">
                {/* Logo */}
                <Link to="/home" className="flex items-center gap-2 group cursor-pointer">
                    <div className="h-8 w-8 rounded flex items-center justify-center
            bg-gradient-to-br dark:from-blue-300 dark:to-indigo-500 text-white shadow-lg
            group-hover:scale-110 transition">
                        {
                            isDark ? (
                                <lord-icon
                                    src="https://cdn.lordicon.com/fikcyfpp.json"
                                    trigger="loop"
                                    colors="primary:#ffffff,secondary:#ffffff"
                                    style={{ width: "50px", height: "50px" }}>
                                </lord-icon>) : (
                                <lord-icon
                                    src="https://cdn.lordicon.com/fikcyfpp.json"
                                    trigger="loop"
                                    colors="primary:#000000,secondary:#000000"
                                    style={{ width: "50px", height: "50px" }}>
                                </lord-icon>
                            )
                        }
                    </div>
                    <span className="font-bold tracking-wide text-lg group-hover:text-blue-500 transition">
                        KhataFlow
                    </span>
                </Link>

                {/* Menu */}
                {isLogin && (<div className="flex items-center flex-row space-x-4 rtl:space-x-reverse">
                    {/* Buttons */}
                    {navLinks.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className="relative px-4 py-2 rounded-xl font-medium overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-r
                before:from-blue-600 before:to-indigo-600 before:opacity-0
                hover:before:opacity-100 before:transition
                hover:scale-105 transition"
                        >
                            <span className={`relative z-10 flex items-center gap-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                <i className="fa fa-plus" /> {item.label}
                            </span>
                        </Link>
                    ))}
                </div>)}

                <div className='flex items-center gap-4'>
                    {/* Dark/Light Mode */}
                    <button
                        onClick={() => {
                            toggleDarkMode();
                            toggleTheme();
                        }}
                        aria-label="Toggle dark mode"
                        className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-700 transition-colors duration-300"
                    >
                        {/* Knob */}
                        <span
                            className={`inline-block h-7 w-7 rounded-full bg-white shadow-md transform transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-1"}`}
                        />

                        {/* Icons */}
                        <div
                            className={`absolute left-1 text-xs text-yellow-400 pointer-events-none transition-opacity duration-300 ${darkMode ? "opacity-0" : "opacity-100"}`}
                        >
                            <Sun />
                        </div>
                        <i
                            className={`absolute right-1 text-xs text-indigo-400 pointer-events-none transition-opacity duration-300 ${darkMode ? "opacity-100" : "opacity-0"}`}
                        >
                            <Moon />
                        </i>
                    </button>

                    {
                        !isLogin && (
                            <div className="flex items-center gap-4">

                                {/* Login - Glass Button */}
                                <Link
                                    to="/login"
                                    className="relative px-5 py-2.5 text-sm font-medium rounded-full backdrop-blur-md bg-white/70 text-gray-800 hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border border-white/30 dark:border-white/20 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500 before:blur-lg before:opacity-40 before:-z-10"
                                >
                                    Login
                                </Link>

                                {/* Signup - Gradient Premium Button */}
                                <Link
                                    to="/signup"
                                    className="relative px-6 py-2.5 text-sm font-semibold rounded-full text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500 before:blur-lg before:opacity-40 before:-z-10"
                                >
                                    Signup
                                </Link>

                            </div>
                        )
                    }

                    {/* User Icon */}
                    {isLogin === false ? "" : <i className={`fa fa-user-circle text-2xl cursor-pointer hover:text-blue-500 transition`} onClick={() => setUserDataDrawer(true)}></i>}

                </div>
            </div>

            {/* Mobile Menu */}
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-col pt-3 nav-2">
                <div className='flex items-center justify-between flex-col px-4 mb-2 w-full'>
                    <div className="flex items-center justify-between w-full group mb-2">
                        {/* Logo */}
                        <Link to="/home" className='flex flex-row items-center gap-2'>
                            <div className="h-8 w-8 rounded flex items-center justify-center bg-gradient-to-br dark:from-blue-300 dark:to-indigo-500 text-white shadow-lg group-hover:scale-110 transition">
                                {
                                    isDark ? (
                                        <lord-icon
                                            src="https://cdn.lordicon.com/fikcyfpp.json"
                                            trigger="loop"
                                            colors="primary:#ffffff,secondary:#ffffff"
                                            style={{ width: "50px", height: "50px" }}>
                                        </lord-icon>) : (
                                        <lord-icon
                                            src="https://cdn.lordicon.com/fikcyfpp.json"
                                            trigger="loop"
                                            colors="primary:#000000,secondary:#000000"
                                            style={{ width: "50px", height: "50px" }}>
                                        </lord-icon>
                                    )
                                }
                            </div>
                            <span className="font-bold tracking-wide text-lg group-hover:text-blue-500 transition">
                                KhataFlow
                            </span>
                        </Link>

                        <div className='flex items-center gap-4'>
                            {/* Dark/Light Mode */}
                            <button
                                onClick={() => {
                                    toggleDarkMode();
                                    toggleTheme();
                                }}
                                aria-label="Toggle dark mode"
                                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-700 transition-colors duration-300"
                            >
                                {/* Knob */}
                                <span
                                    className={`inline-block h-7 w-7 rounded-full bg-white shadow-md transform transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-1"}`}
                                />

                                {/* Icons */}
                                <div
                                    className={`absolute left-1 text-xs text-yellow-400 pointer-events-none transition-opacity duration-300 ${darkMode ? "opacity-0" : "opacity-100"}`}
                                >
                                    <Sun />
                                </div>
                                <i
                                    className={`absolute right-1 text-xs text-indigo-400 pointer-events-none transition-opacity duration-300 ${darkMode ? "opacity-100" : "opacity-0"}`}
                                >
                                    <Moon />
                                </i>
                            </button>

                            {/* User Icon */}
                            {isLogin === false ? "" : <i className={`fa fa-user-circle text-2xl cursor-pointer hover:text-blue-500 transition`} onClick={() => setUserDataDrawer(true)}></i>}
                        </div>
                    </div>
                    {
                        !isLogin && (
                            <div className="flex items-center gap-4">

                                {/* Login - Glass Button */}
                                <Link
                                    to="/login"
                                    className="relative px-3 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm font-medium rounded-full backdrop-blur-md bg-white/70 text-gray-800 hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border border-white/30 dark:border-white/20 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500 before:blur-lg before:opacity-40 before:-z-10"
                                >
                                    Login
                                </Link>

                                {/* Signup - Gradient Premium Button */}
                                <Link
                                    to="/signup"
                                    className="relative px-3 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm font-semibold rounded-full text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500 before:blur-lg before:opacity-40 before:-z-10"
                                >
                                    Signup
                                </Link>

                            </div>
                        )
                    }
                </div>

                {/* Menu */}
                {isLogin && (<div className={`flex items-center justify-between flex-row w-full text-xs ${darkMode ? "bg-slate-500" : "bg-slate-300"}`}>
                    {navLinks.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className="relative px-2 py-2 rounded-xl font-medium overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-r
                before:from-blue-600 before:to-indigo-600 before:opacity-0
                hover:before:opacity-100 before:transition
                hover:scale-105 transition"
                        >
                            <span className={`relative z-10 flex items-center gap-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                <i className="fa fa-plus" /> {item.label}
                            </span>
                        </Link>
                    ))}
                </div>)}
            </div>


            {/* Backdrop */}
            {userDataDrawer && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-md transition-opacity"
                    onClick={() => setUserDataDrawer(false)}
                />
            )}


            {/* Drawer */}
            <div className={`fixed top-0 right-0 z-40 h-screen w-full max-w-sm drawer-3d drawer-glow transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${userDataDrawer ? "translate-x-0 rotate-y-0" : "translate-x-full rotate-y-12"}`}>
                <div className="drawer-inner relative h-full bg-white/80 dark:bg-black/70 backdrop-blur-xl border-l border-white/20 dark:border-white/10 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
                                KhataFlow
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                User Information
                            </p>
                        </div>

                        <button
                            onClick={() => setUserDataDrawer(false)}
                            className="flex justify-center p-2 h-8 w-8 rounded-full bg-white/60 dark:bg-white/10 hover:scale-110 hover:rotate-90 transition-all duration-300"
                        >
                            <i className="fa-solid fa-xmark text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>


                    {/* Body */}
                    <div
                        className="px-6 py-6 space-y-6 overflow-y-auto bg-gradient-to-b from-white/40 to-white/10 dark:from-black/30 dark:to-black/10"
                        style={{ maxHeight: "calc(100vh - 160px)" }}
                    >

                        <div className="group rounded-2xl p-4 bg-white/70 dark:bg-white/5 border border-white/30 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
                                Name
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                {userData.userName}
                            </p>
                            <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
                                Email
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                {userData.email}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Created At */}
                            <div className="rounded-2xl p-4 bg-white/70 dark:bg-white/5 border border-white/30 dark:border-white/10">
                                <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
                                    Created
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {new Date(userData.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {/* Updated At */}
                            <div className="rounded-2xl p-4 bg-white/70 dark:bg-white/5 border border-white/30 dark:border-white/10">
                                <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
                                    Updated
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {new Date(userData.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {isChangePass && (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <i className="fa-solid fa-shield-halved text-blue-500" />
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        Security Settings
                                    </p>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        isPassCorrect ? changePassword(e) : checkCurrentPassword(e);
                                    }}
                                    className="rounded-3xl p-5 space-y-4 bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/10 shadow-lg transition-all"

                                >
                                    <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                                        Change Password
                                    </p>

                                    {/* Current Password */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 dark:text-gray-400">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={form.currentPassword}
                                            onChange={handleChange}
                                            disabled={isPassCorrect}
                                            placeholder="Enter current password"
                                            className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* New Password Section */}
                                    {isPassCorrect && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={form.newPassword}
                                                    onChange={handleChange}
                                                    placeholder="Enter new password"
                                                    className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={form.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Confirm new password"
                                                    className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            {form.confirmPassword &&
                                                form.newPassword !== form.confirmPassword && (
                                                    <p className="text-xs text-red-500">
                                                        Passwords do not match
                                                    </p>
                                                )}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full rounded-xl py-2 text-sm font-medium text-white transition ${loading ? "opacity-50 cursor-not-allowed" : ""} ${isPassCorrect
                                            ? "bg-gradient-to-tr from-green-600 to-emerald-600 hover:scale-[1.02]"
                                            : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-[1.02]"
                                            }`}
                                    >
                                        {loading
                                            ? "Please wait..."
                                            : isPassCorrect
                                                ? "Update Password"
                                                : "Verify Password"}
                                    </button>

                                </form>
                            </>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 left-0 w-full px-6 py-4 border-t border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl">
                        <div className="flex gap-3">
                            <button
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-[1.03] hover:shadow-xl text-white text-sm font-medium px-4 py-2.5 transition"
                                onClick={() => setIsChangePass(prev => !prev)}
                            >
                                <i className="fa-solid fa-key" />
                                {isChangePass ? "Close Password" : "Change Password"}
                            </button>

                            <button
                                onClick={() => {
                                    handleLogout();
                                    setUserDataDrawer(false);
                                    navigate("/login", { replace: true })
                                }}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 hover:scale-[1.03] hover:shadow-xl text-white text-sm font-medium px-4 py-2.5 transition"
                            >
                                <i className="fa-solid fa-right-from-bracket" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </header>
    );
};

export default Navbar;
