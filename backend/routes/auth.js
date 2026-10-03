const express = require("express");
const router = express.Router();
const Signup = require("../model/signup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authUser = require("../middleware/authUser");
const { Resend } = require("resend");

const JWT_SECRET_KEY = process.env.JWT_SECRET;
const resend = new Resend(process.env.RESEND_APIKEY);

const mailing = async ({ userName, email, msg }) => {
    try {
        const randOtp = Math.floor(100000 + Math.random() * 900000).toString();

        if (!randOtp) {
            return res.status(400).json({ message: "OTP not generated" });
        }

        const hashOtp = await bcrypt.hash(randOtp, 10);

        const updateOtp = await Signup.findOneAndUpdate({ email }, { otp: hashOtp, otpExpireAt: Date.now() + 5 * 60 * 1000 });

        if (!updateOtp) {
            return res.status(400).json({ message: "OTP not saving" });
        }

        await resend.emails.send({
            from: "KhataFlow-noreply <KhataFlow-noReply@santoshvishwakarma.site>",
            to: [`${userName} <${email}>`],
            subject: `${msg}`,
            html: `
<div style="background:#f6f9fc;padding:40px 0;font-family:Arial,Helvetica,sans-serif">

  <div style="max-width:540px;margin:auto;background:#ffffff;border-radius:12px;
  box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden">

    <!-- Header -->
    <div style="background:#111827;color:white;padding:28px;text-align:center">
      <h2 style="margin:0;font-weight:600;letter-spacing:0.5px">
        ${msg}
      </h2>
    </div>

    <div style="padding:35px">

      <!-- Greeting -->
      <p style="font-size:16px;color:#374151;margin-bottom:18px">
        Hello <strong>${userName}</strong>,
      </p>

      <p style="font-size:14px;color:#6b7280;line-height:1.6">
        We received a request that requires verification.  
        Please use the one-time password below to continue securely.
      </p>

      <!-- OTP BOX -->
      <div style="text-align:center;margin:35px 0">

        <div style="
          display:inline-block;
          background:#f9fafb;
          border:2px solid #2563eb;
          padding:18px 36px;
          border-radius:10px;
          font-size:34px;
          letter-spacing:8px;
          font-weight:bold;
          color:#2563eb;
          user-select:all;
        ">
          ${randOtp}
        </div>

        <p style="margin-top:12px;font-size:12px;color:#9ca3af">
          Click the code to easily copy it
        </p>

      </div>

      <!-- Message -->
      <div style="
        background:#f3f4f6;
        border-radius:8px;
        padding:16px;
        font-size:14px;
        color:#374151;
        line-height:1.5
      ">
        ${msg}
      </div>

      <!-- Expiry -->
      <p style="font-size:13px;color:#6b7280;margin-top:20px">
        This verification code will expire in <strong>5 minutes</strong>.
      </p>

      <!-- Footer -->
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0">

      <p style="font-size:12px;color:#9ca3af;text-align:center">
        If you didn’t request this email, you can safely ignore it.
      </p>

    </div>

  </div>

</div>
`
        });

    } catch (mailError) {
        console.error("Mail sending failed:", mailError.message);

        return res.status(500).json({
            message: "Login failed: Unable to send confirmation email",
        });
    }
}

router.post("/signup", async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({ message: "Missing input field" });
        }

        const isEmailExist = await Signup.findOne({ email: email.toLowerCase() });

        if (isEmailExist) {
            if (!isEmailExist.isVerified) {
                try {
                    await mailing({
                        userName: isEmailExist.userName,
                        email: isEmailExist.email,
                        msg: "Email Verification OTP"
                    });

                    return res.status(400).json({
                        isVerified: false,
                        email: isEmailExist.email,
                        message: "Email not verified. OTP sent."
                    });

                } catch {
                    return res.status(500).json({
                        message: "Failed to resend OTP"
                    });
                }
            }

            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const saveSignup = new Signup({
            userName: userName,
            email: email,
            password: hashedPassword,
        });

        await saveSignup.save();

        try {
            await mailing({ userName: userName, email: email, msg: "Account creation OTP" })
        } catch (error) {
            return res.status(400).json({ message: "Failed to send otp" });
        }

        return res.status(200).json({ isTrue: true, message: "OTP sent to your email" });

    } catch (error) {
        console.error("Error Occurred in Signup:", error);
        return res.status(500).json({
            message: "Server error during signup"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await Signup.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({
                message: "Email is not registered",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        if (!user.isVerified) {
            try {
                await mailing({
                    userName: user.userName,
                    email: user.email,
                    msg: "Email Verification OTP"
                });

                // send both messages in ONE response
                return res.status(400).json({
                    isVerified: false,
                    email: user.email,
                    message: "Email is not verified. OTP has been sent to your email."
                });

            } catch (error) {
                return res.status(400).json({
                    message: "Email is not verified and failed to send OTP"
                });
            }
        }

        try {
            await mailing({ userName: user.userName, email: user.email, msg: "Login OTP" })
        } catch (error) {
            return res.status(400).json({ message: "Failed to send otp" });
        }

        return res.status(200).json({ isTrue: true, message: "OTP sent to your email" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/forgotPassword", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const user = await Signup.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Email is not registered",
            });
        }

        if (!user.isVerified) {
            try {
                await mailing({
                    userName: user.userName,
                    email: user.email,
                    msg: "Email Verification OTP"
                });

                // send both messages in ONE response
                return res.status(400).json({
                    isVerified: false,
                    email: user.email,
                    message: "Email is not verified. OTP has been sent to your email."
                });

            } catch (error) {
                return res.status(400).json({
                    message: "Email is not verified and failed to send OTP"
                });
            }
        }

        try {
            await mailing({ userName: user.userName, email: user.email, msg: "Forgot Password OTP" })
        } catch (error) {
            return res.status(400).json({ message: "Failed to send otp" });
        }

        return res.status(200).json({ isTrue: true, message: "OTP sent to your email" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
})

router.post("/submitOtp", async (req, res) => {
    try {
        const { email, otp, method } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }

        if (!["login", "signup", "forgot", "verification"].includes(method)) {
            return res.status(400).json({ message: "Invalid method" });
        }

        const user = await Signup.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email is not registered" });
        }

        if (!user.otp) {
            return res.status(400).json({
                message: "OTP not found or already used"
            });
        }

        if (Date.now() > user.otpExpireAt) {
            await user.updateOne({ otp: null, otpExpireAt: null });

            return res.status(400).json({
                isOtpTrue: false,
                message: "OTP expired"
            });
        }

        const isOtpCorrect = await bcrypt.compare(otp, user.otp);

        if (!isOtpCorrect) {
            return res.status(400).json({
                message: "OTP is not correct"
            });
        }

        // clear OTP
        await user.updateOne({ otp: null, otpExpireAt: null });

        // ========================
        // METHOD HANDLING
        // ========================

        if (method === "login") {
            const authToken = jwt.sign({ userId: user.userId }, JWT_SECRET_KEY, { expiresIn: "1h" });
            res.cookie("khataflow_token", authToken, { httpOnly: true, sameSite: "none", secure: true, });
            return res.status(200).json({
                message: "Login success",
                user: { email: user.email, userName: user.userName, isAdmin: user.isAdmin, createdAt: user.createdAt, updatedAt: user.updatedAt, },
            });
        }

        if (method === "signup") {
            await user.updateOne({ isVerified: true });

            return res.status(201).json({
                message: "Account created"
            });
        }

        if (method === "forgot") {
            return res.status(200).json({
                isOtpTrue: true,
                message: "OTP Verified"
            });
        }

        if (method === "verification") {
            await user.updateOne({ isVerified: true });

            return res.status(200).json({
                message: "Account verified successfully"
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/resetPassword", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        const user = await Signup.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Email is not registered",
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);

        if (!hashPassword) {
            return res.status(400).json({ message: "Password failed to change" });
        }

        await user.updateOne({ password: hashPassword });

        return res.status(200).json({ isOtpTrue: false, isTrue: false, message: "New Password Updated" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
})

router.post("/checkLogin", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        return res.status(200).json({
            user: {
                email: isUserExist.email,
                userName: isUserExist.userName,
                isAdmin: isUserExist.isAdmin,
                createdAt: isUserExist.createdAt,
                updatedAt: isUserExist.updatedAt,
            },
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in check login",
        });
    }
})

router.post("/logout", authUser, async (req, res) => {
    try {
        res.clearCookie("khataflow_token", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            path: "/",
        });

        return res.status(200).json({
            message: "Logout successful",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in logout",
        });
    }
})

router.post("/checkCurrentPassword", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { currentPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({
                message: "Current password is required",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Current password is incorrect",
            });
        }

        res.status(200).json({
            message: "Password verified",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Current Password Error" });
    }
})

router.post("/changePassword", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: "New password is required",
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);

        const updatePassword = await user.updateOne({ password: hashPassword });

        if (!updatePassword) {
            return res.status(401).json({
                message: "New password not change",
            });
        }

        res.status(200).json({
            message: "Password changed",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Change Password Error" });
    }
})

router.post("/resendOtp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(404).json({ message: "Email not Found" });
        }

        const isUserExist = await Signup.findOne({ email: email });

        if (!isUserExist) {
            return res.status(404).json({ message: "Email is not Registered" });
        }

        try {
            await mailing({ userName: isUserExist.userName, email: isUserExist.email, msg: "Re-sent OTP" })
        } catch (error) {
            return res.status(400).json({ message: "Failed to send otp" });
        }

        return res.status(200).json({ message: "OTP sent via Email" });

    } catch (error) {
        console.error("Re-Send OTP Error occured:", error);
        res.status(500).json({ message: "Re-Send OTP Error occured" });
    }
})

module.exports = router;