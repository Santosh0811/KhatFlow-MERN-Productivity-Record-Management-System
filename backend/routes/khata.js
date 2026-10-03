const express = require("express");
const router = express.Router();
const khata = require("../model/khata");
const authUser = require("../middleware/authUser");
const Signup = require("../model/signup");

router.post("/saveKhataLedger", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(400).json({ message: "Login required" });
        }

        const { title, date, rows } = req.body;

        if (!rows || rows.length === 0 || !title || !date) {
            return res.status(400).json({ message: "All inputs required" });
        }

        const saveKhata = new khata({
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            title,
            date,
            rows, // ✅ save array directly
        });

        await saveKhata.save();

        return res.status(200).json({
            message: "Khata saved successfully",
            // khataId: saveKhata._id,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in saving khata ledger",
        });
    }
});

router.get("/getKhataLedgers", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const khatas = await khata.find({ userId: user.userId });

        return res.status(200).json({
            success: true,
            data: khatas, // ✅ always array
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching khata ledger",
        });
    }
});

router.put("/updateKhataLedger/:khataId", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { khataId } = req.params;
        const { title, date, rows } = req.body;

        const khatas = await khata.findByIdAndUpdate({ _id: khataId }, { title, date, rows });

        if (!khatas) {
            return res.status(400).json({ message: "Khata failed to update" });
        }

        return res.status(200).json({
            success: true,
            data: khatas, // ✅ always array
            message: "Khata updated sucessfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating khata ledger",
        });
    }
})

router.delete("/deleteKhata/:id", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Khata not found" });
        }

        const deleteKhata = await khata.findByIdAndDelete({ _id: id });

        if (!deleteKhata) {
            return res.status(400).json({ message: "Delete failed" });
        }

        return res.status(200).json({ message: "Khata deleted" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Delete Khata Error" });
    }
})

module.exports = router;