import React, { useContext, useEffect } from "react";
import { Wallet, ClipboardCheck, Users, TrendingUp, IndianRupee, FileText, Receipt, NotebookPen, CreditCard, Repeat, BarChart3, CalendarDays, Sparkles, CalendarClock, BookOpen, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";
import TodoContext from "../context/TodoContext";

const Home = () => {
    const { resetTimer, navigate, isLogin, useTitle } = useContext(TodoContext);

    useTitle("KhataFlow")

    useEffect(() => {
        if (isLogin) {
            navigate("/form", { replace: true });
        }
    }, [isLogin, navigate]);

    useEffect(() => {
        resetTimer();
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden
        bg-gradient-to-br from-slate-100 via-white to-slate-200/50
        dark:from-slate-950 dark:via-slate-900 dark:to-black
        text-slate-900 dark:text-slate-100">

            {/* FLOATING ICONS */}
            <FloatingIcon Icon={Wallet} className="top-24 left-10 text-black dark:text-emerald-400" />
            <FloatingIcon Icon={ClipboardCheck} className="top-1/3 right-12 text-black dark:text-indigo-400 delay-200" />
            <FloatingIcon Icon={Users} className="bottom-32 left-1/4 text-black dark:text-pink-400 delay-500" />
            <FloatingIcon Icon={TrendingUp} className="bottom-24 right-1/4 text-black dark:text-amber-400 delay-700" />
            <FloatingIcon Icon={IndianRupee} className="top-40 right-1/3 text-black dark:text-green-400 delay-300" />
            <FloatingIcon Icon={CreditCard} className="bottom-1/3 right-10 text-black dark:text-cyan-400 delay-600" />
            <FloatingIcon Icon={Repeat} className="top-1/2 left-16 text-black dark:text-violet-400 delay-400" />
            <FloatingIcon Icon={Receipt} className="bottom-20 left-1/3 text-black dark:text-orange-400 delay-800" />
            <FloatingIcon Icon={FileText} className="top-16 right-20 text-black dark:text-sky-400 delay-500" />
            <FloatingIcon Icon={NotebookPen} className="bottom-40 right-1/2 text-black dark:text-rose-400 delay-900" />
            <FloatingIcon Icon={BarChart3} className="top-1/4 left-1/2 text-black dark:text-lime-400 delay-1000" />
            <FloatingIcon Icon={CalendarDays} className="bottom-10 right-1/6 text-black dark:text-yellow-400 delay-1100" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

                {/* HERO */}
                <div className="text-center mb-16 sm:mb-24">

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
                    bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
                    text-xs sm:text-sm font-medium mb-4">
                        <Sparkles size={14} className="sm:w-4 sm:h-4" />
                        Built for Accuracy, Simplicity & Control
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-snug">
                        One Platform to Manage
                        <span className="text-emerald-500"> Tasks</span>,{" "}
                        <span className="text-indigo-500"> Transactions</span> &{" "}
                        <span className="text-pink-500"> Customer Accounts</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed
                    text-slate-600 dark:text-slate-400 px-2">
                        A secure and structured system to manage your daily todos,
                        maintain advance & deposit ledgers, and track customer accounts
                        with complete transparency and confidence.
                    </p>

                    <div className="mt-8 sm:mt-10 flex justify-center gap-3 sm:gap-4 flex-wrap">
                        <PrimaryBtn
                            icon={<CalendarClock size={16} />}
                            text="Create Todo"
                            onClick={() => navigate("/form")}
                        />
                        <SecondaryBtn
                            icon={<BookOpen size={16} />}
                            text="Open Khata Ledger"
                            onClick={() => navigate("/khatanote")}
                        />
                    </div>
                </div>

                {/* CORE FEATURES */}
                <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
                    <FeatureCard
                        icon={<ClipboardCheck size={24} />}
                        title="Todo & Event Management"
                        desc="Plan, organize, and monitor your tasks with precise date and time tracking to ensure nothing is missed."
                        color="emerald"
                        onClick={() => navigate("/form")}
                    />
                    <FeatureCard
                        icon={<Wallet size={24} />}
                        title="Khata Ledger System"
                        desc="Maintain detailed advance and deposit records with automatic balance calculation and professional PDF reports."
                        color="indigo"
                        onClick={() => navigate("/khatanote")}
                    />
                    <FeatureCard
                        icon={<Users size={24} />}
                        title="Customer Account Management"
                        desc="Create individual customer accounts and track outstanding balances with complete financial clarity."
                        color="pink"
                        onClick={() => navigate("/customer")}
                    />
                </div>

                {/* WHY SYSTEM */}
                <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
                    <InfoCard icon={<ShieldCheck />} title="Secure & Reliable"
                        text="Your data is stored securely and structured for long-term reliability and accuracy." />
                    <InfoCard icon={<BarChart3 />} title="Clear Financial Overview"
                        text="Instantly view money given, money received, and net balance without manual calculations." />
                    <InfoCard icon={<FileText />} title="Professional Reports"
                        text="Generate clean, well-formatted PDF statements suitable for records and sharing." />
                </div>

                {/* QUICK ACTIONS */}
                <div className="grid md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24">
                    <MiniCard icon={<UserPlus />} text="Create New Customer" />
                    <MiniCard icon={<Wallet />} text="Add Ledger Entry" />
                    <MiniCard icon={<ClipboardCheck />} text="Manage Todos" />
                    <MiniCard icon={<FileText />} text="View Reports" />
                </div>

                {/* FOOTER */}
                <div className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} Personal Productivity & Ledger Management System
                    <br />
                    Designed for accuracy, transparency, and everyday use.
                </div>

            </div>
        </div>
    );
};

export default Home;

/* COMPONENTS */

const FeatureCard = ({ icon, title, desc, color, onClick }) => (
    <div
        onClick={onClick}
        className="group cursor-pointer rounded-3xl p-5 sm:p-6
        bg-white/70 dark:bg-white/5 backdrop-blur
        border border-black/5 dark:border-white/10
        shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
    >
        <div className={`w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-2xl
        bg-${color}-500/10 text-${color}-500
        flex items-center justify-center group-hover:scale-110 transition`}>
            {icon}
        </div>

        <h3 className="text-base sm:text-xl font-semibold mb-2">{title}</h3>

        <p className="text-xs sm:text-sm md:text-base
        text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            {desc}
        </p>

        <div className={`flex items-center text-xs sm:text-sm text-${color}-600 dark:text-${color}-400 font-medium`}>
            Open <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition" />
        </div>
    </div>
);

const InfoCard = ({ icon, title, text }) => (
    <div className="rounded-2xl p-5 sm:p-6
    bg-white/70 dark:bg-white/5 backdrop-blur
    border border-black/5 dark:border-white/10
    hover:shadow-xl transition">
        <div className="w-10 h-10 sm:w-12 sm:h-12 mb-4 rounded-xl
        bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            {icon}
        </div>
        <h4 className="font-semibold text-sm sm:text-lg mb-2">{title}</h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {text}
        </p>
    </div>
);

const MiniCard = ({ icon, text }) => (
    <div className="rounded-2xl p-4 sm:p-5
    bg-white/70 dark:bg-white/5 backdrop-blur
    border border-black/5 dark:border-white/10
    flex items-center gap-3 sm:gap-4 hover:scale-105 transition">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl
        bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            {icon}
        </div>
        <span className="text-xs sm:text-sm font-medium">{text}</span>
    </div>
);

const PrimaryBtn = ({ icon, text, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2
        px-4 py-2 sm:px-6 sm:py-3
        text-xs sm:text-sm
        rounded-xl bg-emerald-600 hover:bg-emerald-700
        text-white font-medium shadow-md hover:shadow-lg transition">
        {icon}
        {text}
    </button>
);

const SecondaryBtn = ({ icon, text, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2
        px-4 py-2 sm:px-6 sm:py-3
        text-xs sm:text-sm
        rounded-xl bg-slate-900 dark:bg-white
        dark:text-black text-white hover:opacity-90
        font-medium shadow-md transition">
        {icon}
        {text}
    </button>
);

const FloatingIcon = ({ Icon, className }) => (
    <Icon size={36} className={`absolute opacity-15 sm:opacity-20 animate-float ${className}`} />
);
