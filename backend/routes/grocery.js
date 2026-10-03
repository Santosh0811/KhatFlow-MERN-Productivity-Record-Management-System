const express = require("express");
const router = express.Router();
const groceryNote = require("../model/groceryNote");
const authUser = require("../middleware/authUser");
const Signup = require("../model/signup");

router.post("/saveGroceryNote", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { title, items, total } = req.body;

        if (!items || items.length === 0 || !title || !total) {
            return res.status(400).json({ message: "All inputs required" });
        }

        const saveGrocery = new groceryNote({
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            title,
            total,
            items, // ✅ save array directly
        });

        if (!saveGrocery) {
            return res.status(400).json({ message: "Failed to save grocery note" });
        }

        await saveGrocery.save();

        return res.status(200).json({
            message: `${title} grocery saved`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Save Grocery Note Error" });
    }
})

router.put("/updateGroceryNote/:updateId", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { updateId } = req.params;
        const { updateTitle, items, total } = req.body;

        if (!items || items.length === 0 || !updateTitle || !total) {
            return res.status(400).json({ message: "All inputs required" });
        }

        const updateGrocery = await groceryNote.findByIdAndUpdate({ _id: updateId }, { title: updateTitle, total, items })

        if (!updateGrocery) {
            return res.status(400).json({ message: "Failed to update grocery note" });
        }

        return res.status(200).json({
            message: `${updateTitle} grocery updated`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Update Grocery Note Error" });
    }
})

router.delete("/deleteGroceryNote/:id", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "No any Grocery Note found" });
        }

        const deleteGrocery = await groceryNote.findByIdAndDelete({ _id: id })

        if (!deleteGrocery) {
            return res.status(400).json({ message: "Failed to delete grocery note" });
        }

        return res.status(200).json({
            message: `${deleteGrocery.title} grocery deleted`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Delete Grocery Note Error" });
    }
})

router.get("/fetchGroceryNotes", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const fetchGroceryNote = await groceryNote.find({ userId: req.userId });

        if (!fetchGroceryNote.length) {
            return res.status(200).json({
                GroceryNotes: [],
                message: "No Grocery notes available"
            });
        }

        return res.status(200).json({
            GroceryNotes: fetchGroceryNote
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "failed to fetch grocery note" });
    }
})

module.exports = router;