import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TodoContext from '../context/TodoContext';

const Login = () => {
    const [loginForm, setLoginForm] = useState({ email: "", password: "", otp: "" });
    const { BACKEND_URL, callToast, setIsLogin, checkLogin, isLogin, setUserData, useTitle, darkMode, isDark, isResendDisabled, setIsResendDisabled, timer, handleResendOtp, loading, setLoading, setTimer, setCountdown, intervalRef, resetTimer, navigate } = useContext(TodoContext);
    const [isTrue, setIsTrue] = useState(false);

    useTitle("Login");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setLoginForm((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm)
            })

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setIsTrue(data.isTrue);
            }
            else {
                if (data.isVerified === false) {
                    callToast("success", data.message);
                    navigate(`/verificationPage/${data.email}`, { replace: true });
                }
                else {
                    callToast("error", data.message);
                }
                setIsTrue(false);
            }
        } catch (error) {
            console.log(error);
            callToast("Login error", error);
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
                credentials: "include",
                body: JSON.stringify({ email: loginForm.email, otp: loginForm.otp, method: "login" })
            })

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setUserData(data.user);
                setIsLogin(true);
                setLoginForm({ email: "", password: "", otp: "" });
                navigate("/form", { replace: true });
                setIsTrue(false);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                setCountdown(0);
                setTimer("00:00");
                setIsResendDisabled(false);
            }
            else {
                callToast("error", data.message);
                setIsLogin(false);
                setUserData([]);
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
        checkLogin();
        resetTimer();
    }, []);


    return (
        <div>
            <section className={`min-h-screen ${darkMode ? "bg-black" : "bg-gray-50"}`}>
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
                    <Link to="/home" className={`flex items-center text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"} gap-2`}>
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
                    <div className="w-full md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className={`text-xl font-bold leading-tight tracking-tight ${darkMode ? "text-white" : "text-gray-900"} md:text-2xl`}>
                                Sign in to your account
                            </h1>
                            <form className="space-y-4 md:space-y-6" action="#" onSubmit={(e) => {
                                isTrue ?
                                    handleSubmitOtp(e) :
                                    handleLogin(e)
                            }}>
                                <div>
                                    <label htmlFor="email" className={`block mb-2 text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Your email</label>
                                    <input type="email" name="email" id="email" className={`${darkMode ? "bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600"} border rounded-lg block w-full p-2.5`} placeholder="name@company.com" required="" value={loginForm.email} onChange={handleChange} disabled={isTrue} />
                                </div>
                                <div>
                                    <label htmlFor="password" className={`block mb-2 text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Password</label>
                                    <input type="password" name="password" id="password" placeholder="••••••••" className={`${darkMode ? "bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600"} border rounded-lg block w-full p-2.5`} required="" value={loginForm.password} onChange={handleChange} disabled={isTrue} />
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
                                                            onClick={() => handleResendOtp(loginForm.email)}
                                                            className="block mb-1 text-xs font-medium hover:underline transition-opacity duration-200 text-gray-900 dark:text-white">
                                                            Re-Send OTP
                                                        </button>
                                                    )
                                                }
                                            </div>
                                            <input type="number" name="otp" id="otp" value={loginForm.otp} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required="" />
                                        </div>
                                    )
                                }
                                <div className="flex items-center justify-end">
                                    <Link to="/forgotpassword" className={`text-sm font-medium ${darkMode ? "text-blue-500" : "text-blue-600"}  hover:underline`}>Forgot password?</Link>
                                </div>
                                <button type="submit" className={`w-full ${darkMode ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-800" : "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"} focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center `}>Sign in</button>
                                <p className={`text-sm font-light ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Don't have an account yet? <Link to="/signup" className={`font-medium ${darkMode ? "text-blue-500" : "text-blue-600"} hover:underline`}>Sign up</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Login
