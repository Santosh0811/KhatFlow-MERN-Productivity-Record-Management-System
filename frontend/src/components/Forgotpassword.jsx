import React, { useEffect } from 'react'
import { useContext } from 'react';
import { Link } from 'react-router-dom'
import TodoContext from "../context/TodoContext";
import { useState } from 'react';

const Forgotpassword = () => {
    const [isTrue, setIsTrue] = useState(false);
    const [isOtpTrue, setIsOtpTrue] = useState(false);
    const [form, setForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    const { BACKEND_URL, callToast, isDark, isResendDisabled, setIsResendDisabled, timer, handleResendOtp, loading, setLoading, setTimer, setCountdown, intervalRef, resetTimer, navigate, isLogin } = useContext(TodoContext);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/auth/forgotPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email })
            })

            const data = await response.json();

            if (response.ok) {
                setIsTrue(data.isTrue);
                callToast("success", data.message);
            }
            else {
                setIsTrue(false);
                if (data.isVerified === false) {
                    callToast("success", data.message);
                    navigate(`/verificationPage/${data.email}`, { replace: true });
                }
                else {
                    callToast("error", data.message);
                }
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmitOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/auth/submitOtp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, otp: form.otp, method: "forgot" })
            })

            const data = await response.json();

            if (response.ok) {
                setIsOtpTrue(data.isOtpTrue);
                callToast("success", data.message);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                setCountdown(0);
                setTimer("00:00");
                setIsResendDisabled(false);
            }
            else {
                setIsOtpTrue(false);
                callToast("error", data.message);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (form.newPassword != form.confirmPassword) {
            return callToast("info", "Password is not matching");
        }
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/auth/resetPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, newPassword: form.newPassword, method: "forgot" })
            })

            const data = await response.json();

            if (response.ok) {
                setIsOtpTrue(data.isOtpTrue);
                setIsTrue(data.isTrue);
                callToast("success", data.message);
                setForm({ email: "", otp: "", newPassword: "", confirmPassword: "" })
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isLogin) {
            navigate("/form", { replace: true });
        }
    }, [isLogin, navigate]);

    useEffect(() => {
        resetTimer();
    }, [])

    return (
        <div>
            <section className="min-h-screen bg-gray-50 dark:bg-black">
                {loading && (<div className="fixed inset-0 w-full h-full bg-black/90 z-50 flex items-center justify-center">
                    <div className="flex items-center justify-center py-10">
                        <div className="relative h-14 w-14">
                            {/* Outer Ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-gray-500/20"></div>

                            {/* Animated Spinner */}
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-400 border-r-gray-500 animate-spin shadow-[0_0_20px_rgba(34,211,238,0.45)]"></div>
                        </div>
                    </div>
                </div>)}
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <Link to="/home" className="flex items-center mb-3 text-2xl font-semibold text-gray-900 dark:text-white gap-2">
                        {
                            isDark ? (
                                <lord-icon
                                    src="https://cdn.lordicon.com/fikcyfpp.json"
                                    trigger="loop"
                                    colors="primary:#ffffff,secondary:#ffffff"
                                    style={{ width: "40px", height: "40px" }}>
                                </lord-icon>) : (
                                <lord-icon
                                    src="https://cdn.lordicon.com/fikcyfpp.json"
                                    trigger="loop"
                                    colors="primary:#000000,secondary:#000000"
                                    style={{ width: "40px", height: "40px" }}>
                                </lord-icon>
                            )
                        }
                        KhataFlow
                    </Link>
                    <div className="w-full md:mt-0 sm:max-w-md sm:p-8">
                        <h1 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Forgot your password?
                        </h1>
                        <p className="font-light text-gray-500 dark:text-gray-400">Don't fret! Just type in your email and we will send you a code to reset your password!</p>
                        <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={(e) => {
                            { isOtpTrue ? handleResetPassword(e) : isTrue ? handleSubmitOtp(e) : handleForgotPassword(e) }
                        }}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                <input type="email" name="email" id="email" value={form.email} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required="" disabled={isTrue} />
                            </div>
                            {
                                isTrue && (
                                    <div>
                                        <div className='flex flex-row items-center justify-between'>
                                            <label htmlFor="otp" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your OTP</label>

                                            {
                                                isResendDisabled ? (
                                                    <span className="block mb-1 text-xs font-medium dark:text-white">
                                                        Re-send in {timer}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResendOtp(form.email)}
                                                        className="block mb-1 text-xs font-medium hover:underline transition-opacity duration-200 text-gray-900 dark:text-white"
                                                        disabled={isOtpTrue}>
                                                        Re-Send OTP
                                                    </button>
                                                )
                                            }
                                        </div>
                                        <input type="number" name="otp" id="otp" value={form.otp} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required="" disabled={isOtpTrue} />
                                    </div>
                                )
                            }

                            {
                                isOtpTrue && (
                                    <div className='flex gap-2 flex-col'>
                                        <div>
                                            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                                            <input type="password" name="newPassword" id="newPassword" value={form.newPassword} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required="" />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Password</label>
                                            <input type="password" name="confirmPassword" id="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required="" />
                                            {
                                                form.confirmPassword.length > 0 &&
                                                form.newPassword !== form.confirmPassword &&
                                                <p className="text-red-600 text-sm">
                                                    Password is not matching
                                                </p>
                                            }
                                        </div>
                                    </div>
                                )
                            }

                            <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{isOtpTrue ? "Reset Password" : isTrue ? "Submit OTP" : "Submit"}</button>
                        </form>
                    </div>
                </div >
            </section >
        </div >
    )
}

export default Forgotpassword
