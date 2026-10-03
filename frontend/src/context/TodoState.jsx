import React, { useEffect, useRef, useState } from 'react'
import TodoContext from './TodoContext'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TodoState = (props) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
    const [todoData, setTodoData] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [userData, setUserData] = useState([]);
    const [khatas, setKhatas] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [darkMode, setDarkMode] = useState(true);
    const toggleDarkMode = () => setDarkMode(!darkMode);
    const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [timer, setTimer] = useState("00:00");
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [resendOtpText, setResendOtpText] = useState("");

    const intervalRef = useRef(null);
    const navigate = useNavigate();

    const [confirm, setConfirm] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    const openConfirm = ({ title, message, onConfirm }) => {
        setConfirm({ open: true, title, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirm({ open: false, title: "", message: "", onConfirm: null });
    };

    const toggleTheme = () => {
        const root = document.documentElement
        const enabled = root.classList.toggle("dark") // adds/removes `.dark`
        setIsDark(enabled) // update states
    }

    const callToast = (type, message) => {
        const toastMap = {
            success: toast.success,
            error: toast.error,
            info: toast.info,
            warn: toast.warn,
            default: toast,
        };

        const toastFn = toastMap[type] || toast;

        toastFn(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            // transition: Bounce,
        });
    }

    const useTitle = (title) => {
        useEffect(() => {
            document.title = title;
        }, [title]);
    };

    const fetchTodo = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/todo/readTodoForm`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                setTodoData(data.fetchTodo);
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            callToast("error", error);
            console.log("Todo fetch Error", error);
        }
    }

    const checkLogin = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/checkLogin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            const data = await response.json();

            if (response.ok) {
                setIsLogin(true);
                setUserData(data.user);
            }
            else {
                setIsLogin(false);
                setUserData([]);
            }

        } catch (error) {
            callToast("error", error);
            console.log("Check Login Error", error);
        }
    }

    const handleLogout = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                setUserData({});
                setTodoData([]);
                setKhatas([]);
                setCurrentCustomer([]);
                setCustomers([]);
                setIsLogin(false);
                navigate("/home");
                callToast("success", data.message);
            }
            else {
                callToast("error", data.message);
            }

        } catch (error) {
            console.error("Logout Error:", error);
            callToast("error", "Something went wrong while logging out");
        }
    };

    const fetchKhatas = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/khata/getKhataLedgers`, {
                method: "GET",
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                setKhatas(data.data || []);
            } else {
                setKhatas([]);
            }
        } catch (err) {
            console.error("Failed to fetch khata ledgers:", err);
            setKhatas([]);
        }
    };

    const handleResendOtp = async (email) => {
        setLoading(true);
        setResendOtpText("Resend OTP in Progress...");
        try {
            const response = await fetch(`${BACKEND_URL}/auth/resendOtp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message || "Re-Send the OTP to Email");

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setCountdown(0);
                    setTimer("00:00");
                }

                setIsResendDisabled(true);
                setCountdown(600); // 10 minutes in seconds

                intervalRef.current = setInterval(() => {
                    setCountdown((prevCountdown) => {
                        const minutes = Math.floor(prevCountdown / 60);
                        const seconds = prevCountdown % 60;
                        // console.log(`Countdown: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        setTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

                        if (prevCountdown <= 1) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                            setCountdown(0);
                            setIsResendDisabled(false);
                            return 0;
                        }

                        return prevCountdown - 1;
                    });
                }, 1000);
            }
            else {
                callToast("error", data.message || "Re-Send OTP Failed");
            }

        } catch (error) {
            console.error("Resend OTP Failed", error);
            callToast("error", "Resend OTP Failed");
        } finally {
            setLoading(false);
            setResendOtpText("");
        }
    };

    const resetTimer = () => {

        if (intervalRef.current) {
            clearInterval(
                intervalRef.current
            );

            intervalRef.current = null;
        }

        setCountdown(0);

        setTimer("00:00");

        setIsResendDisabled(false);
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        checkLogin();
        resetTimer();
    }, []);

    return (
        <TodoContext.Provider value={{ BACKEND_URL, callToast, todoData, setTodoData, fetchTodo, isLogin, setIsLogin, checkLogin, userData, setUserData, handleLogout, fetchKhatas, khatas, customers, setCustomers, currentCustomer, setCurrentCustomer, toggleDarkMode, darkMode, useTitle, toggleTheme, isDark, setDarkMode, confirm, openConfirm, closeConfirm, isResendDisabled, setIsResendDisabled, timer, setTimer, handleResendOtp, loading, setLoading, setCountdown, intervalRef, resetTimer, navigate }}>
            {props.children}
        </TodoContext.Provider>
    )
}

export default TodoState
