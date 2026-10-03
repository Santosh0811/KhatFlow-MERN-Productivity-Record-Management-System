import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import TodoContext from "../context/TodoContext";

const VerificationPage = () => {
    const { email } = useParams();
    const { BACKEND_URL, callToast, isResendDisabled, setIsResendDisabled, timer, handleResendOtp, loading, setLoading, setTimer, setCountdown, intervalRef, resetTimer, navigate, isLogin } = useContext(TodoContext);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const inputRefs = useRef([]);

    const handleChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const finalOtp = otp.join("");

        if (finalOtp.length !== 6) {
            return setError("Enter complete OTP");
        }

        try {
            setLoading(true);

            const response = await fetch(`${BACKEND_URL}/auth/submitOtp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    otp: finalOtp, // ✅ FIXED
                    method: "verification"
                })
            });

            const data = await response.json();

            if (response.ok) {
                callToast("success", data.message);
                setOtp(["", "", "", "", "", ""]); // ✅ FIXED
                navigate("/login", { replace: true });
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                setCountdown(0);
                setTimer("00:00");
                setIsResendDisabled(false);
            } else {
                callToast("error", data.message);
            }

        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const maskedEmail = email?.replace(/(.{2}).+(@.+)/, "$1****$2");

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (isLogin) {
            navigate("/form", { replace: true });
        }
    }, [isLogin, navigate]);

    useEffect(() => {
        resetTimer();
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black transition">
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
            <form
                onSubmit={handleSubmit}
                className="p-8 w-full max-w-md transition"
            >
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                    OTP Verification
                </h2>

                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                    Sent to {maskedEmail}
                </p>

                <div className="flex items-center justify-end mb-2">
                    {
                        isResendDisabled ? (
                            <span className="block mb-1 text-xs font-medium dark:text-white">
                                Re-send in {timer}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleResendOtp(email)}
                                className="block mb-1 text-xs font-medium hover:underline transition-opacity duration-200 text-gray-900 dark:text-white">
                                Re-Send OTP
                            </button>
                        )
                    }
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-between mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            value={digit}
                            maxLength="1"
                            ref={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-12 text-center border rounded-lg text-xl 
    bg-white dark:bg-gray-700 
    text-gray-800 dark:text-white 
    border-gray-300 dark:border-gray-600 
    focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-500 text-sm text-center mb-4">
                        {error}
                    </p>
                )}

                {/* Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>
            </form>
        </div>
    );
};

export default VerificationPage;