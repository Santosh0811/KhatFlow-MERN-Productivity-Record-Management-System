require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoDbConnect = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const port = process.env.PORT;
const auth = require("./routes/auth");
const todo = require("./routes/todo");
const khata = require("./routes/khata");
const account = require("./routes/account");
const grocery = require("./routes/grocery");
const admin = require("./routes/admin");

mongoDbConnect();
app.use(cookieParser());

app.use(cors({ origin: [process.env.MY_FRONTEND_ORIGIN, process.env.MY_FRONTEND_ORIGIN_2], credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>KhataFlow API</title>
        <style>
            *{
                margin:0;
                padding:0;
                box-sizing:border-box;
                font-family:Arial, sans-serif;
            }

            body{
                height:100vh;
                display:flex;
                justify-content:center;
                align-items:center;
                background:linear-gradient(135deg,#0f172a,#1e293b,#0f172a);
                color:white;
            }

            .card{
                text-align:center;
                padding:40px;
                border-radius:20px;
                background:rgba(255,255,255,0.08);
                backdrop-filter:blur(10px);
                border:1px solid rgba(255,255,255,0.15);
                box-shadow:0 20px 40px rgba(0,0,0,0.3);
                max-width:600px;
            }

            h1{
                font-size:2.5rem;
                margin-bottom:15px;
            }

            p{
                color:#cbd5e1;
                line-height:1.6;
            }

            .badge{
                display:inline-block;
                margin-top:20px;
                padding:8px 16px;
                border-radius:999px;
                background:#22c55e;
                color:white;
                font-size:14px;
                font-weight:bold;
            }

            .btn{
                display:inline-block;
                margin-top:20px;
                padding:12px 24px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:10px;
                font-weight:bold;
                transition:.3s;
            }

            .btn:hover{
                background:#1d4ed8;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🚀 KhataFlow API</h1>
            <p>
                Welcome to the KhataFlow Backend Service.
                This server powers customer management,
                khata records, grocery notes, todo events,
                and secure authentication.
            </p>

            <div class="badge">
                Server Status: Online ✅
            </div>

            <a
                href="${process.env.MY_FRONTEND_ORIGIN}"
                target="_blank"
                class="btn"
            >
                Open KhataFlow →
            </a>
        </div>
    </body>
    </html>
    `);
});

app.use("/auth", auth);
app.use("/todo", todo);
app.use("/khata", khata);
app.use("/account", account);
app.use("/grocery", grocery);
app.use("/admin", admin);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
