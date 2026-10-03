const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const router = express.Router();
const Signup = require("../model/signup");
const TodoForm = require("../model/todoForm");
const khata = require("../model/khata");
const Account = require("../model/account");
const groceryNote = require("../model/groceryNote");

router.get("/khataFlowUserData", adminAuth, async (req, res) => {
    try {
        const users = await Signup.find().select("-password");;

        if (users.length === 0) {
            return res.status(200).json({ success: true, data: [], message: "No users found in Khataflow Site" });
        }

        return res.status(200).json({ success: true, data: users, message: `${users.length} users found` });

    } catch (error) {
        console.log("Error while fetching KhataFlow User Data", error);
        return res.status(500).json({ success: false, message: "Error while fetching KhataFlow User Data" });
    }
})

router.delete("/khataFlowUserDelete/:userId", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        const deleteAllKhataItems = await Promise.all([
            TodoForm.deleteMany({ userId }),
            khata.deleteMany({ userId }),
            Account.deleteMany({ userId }),
            groceryNote.deleteMany({ userId })
        ]);

        if (!deleteAllKhataItems) {
            return res.status(404).json({ success: false, message: "All khata items not deleted" });
        }

        const deleteUser = await Signup.findOneAndDelete({ userId: userId });

        if (!deleteUser) {
            return res.status(404).json({ success: false, message: "User not deleted" });
        }

        return res.status(200).json({ success: true, message: "User and all related data deleted successfully" });

    } catch (error) {
        console.log("Error while deleting KhataFlow User", error);
        return res.status(404).json({ success: false, message: "Error while deleting KhataFlow User" });
    }
})

router.get("/khataFlowTodoData/:userId", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        const todos = await TodoForm.find({ userId: userId });

        if (todos.length === 0) {
            return res.status(200).json({ success: true, data: [], message: "No todos found in Khataflow Site" });
        }

        return res.status(200).json({ success: true, data: todos, message: `${todos.length} data found` });

    } catch (error) {
        console.log("Error while fetching KhataFlow User todos", error);
        return res.status(404).json({ success: false, message: "Error while fetching KhataFlow User todos" });
    }
})

router.get("/khataFlowKhataData/:userId", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        const khatas = await khata.find({ userId: userId });

        if (khatas.length === 0) {
            return res.status(200).json({ success: true, data: [], message: "No khata found in Khataflow Site" });
        }

        return res.status(200).json({ success: true, data: khatas, message: `${khatas.length} data found` });

    } catch (error) {
        console.log("Error while fetching KhataFlow User khatas", error);
        return res.status(404).json({ success: false, message: "Error while fetching KhataFlow User khatas" });
    }
})

router.get("/khataFlowAccountData/:userId", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        const Accounts = await Account.find({ userId: userId });

        if (Accounts.length === 0) {
            return res.status(200).json({ success: true, data: [], message: "No Account found in Khataflow Site" });
        }

        return res.status(200).json({ success: true, data: Accounts, message: `${Accounts.length} data found` });

    } catch (error) {
        console.log("Error while fetching KhataFlow User Accounts", error);
        return res.status(404).json({ success: false, message: "Error while fetching KhataFlow User Accounts" });
    }
})

router.get("/khataFlowGroceryData/:userId", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        const grocerys = await groceryNote.find({ userId: userId });

        if (grocerys.length === 0) {
            return res.status(200).json({ success: true, data: [], message: "No grocery found in Khataflow Site" });
        }

        return res.status(200).json({ success: true, data: grocerys, message: `${grocerys.length} data found` });

    } catch (error) {
        console.log("Error while fetching KhataFlow User grocerys", error);
        return res.status(404).json({ success: false, message: "Error while fetching KhataFlow User grocerys" });
    }
})

router.delete("/khataFlowTodoDelete/:userId/:itemId", adminAuth, async (req, res) => {
    try {
        const { userId, itemId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        if (!itemId) {
            return res.status(404).json({ message: "No item found" });
        }

        const deleteTodos = await TodoForm.deleteOne({ userId, _id: itemId });

        if (deleteTodos.deletedCount === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }

        return res.status(200).json({ message: "Todos deleted successfully" });

    } catch (error) {
        console.log("Error while deleteing KhataFlow User todos", error);
        return res.status(500).json({ success: false, message: "Error while deleting KhataFlow User todos" });
    }
})

router.delete("/khataFlowKhataDelete/:userId/:itemId", adminAuth, async (req, res) => {
    try {
        const { userId, itemId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        if (!itemId) {
            return res.status(404).json({ message: "No item found" });
        }

        const deleteKhatas = await khata.deleteOne({ userId, _id: itemId });

        if (deleteKhatas.deletedCount === 0) {
            return res.status(404).json({ message: "Khata not found" });
        }

        return res.status(200).json({ message: "khata deleted successfully" });

    } catch (error) {
        console.log("Error while deleteing KhataFlow User khatas", error);
        return res.status(500).json({ success: false, message: "Error while deleting KhataFlow User khatas" });
    }
})

router.delete("/khataFlowAccountDelete/:userId/:itemId", adminAuth, async (req, res) => {
    try {
        const { userId, itemId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        if (!itemId) {
            return res.status(404).json({ message: "No item found" });
        }

        const deleteAccounts = await Account.deleteOne({ userId, _id: itemId });

        if (deleteAccounts.deletedCount === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        return res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        console.log("Error while deleteing KhataFlow User Accounts", error);
        return res.status(500).json({ success: false, message: "Error while deleting KhataFlow User Accounts" });
    }
})

router.delete("/khataFlowGroceryDelete/:userId/:itemId", adminAuth, async (req, res) => {
    try {
        const { userId, itemId } = req.params;

        if (!userId) {
            return res.status(404).json({ message: "No user found" });
        }

        if (!itemId) {
            return res.status(404).json({ message: "No item found" });
        }

        const deleteGrocerys = await groceryNote.deleteOne({ userId, _id: itemId });

        if (deleteGrocerys.deletedCount === 0) {
            return res.status(404).json({ message: "Grocery not found" });
        }

        return res.status(200).json({ message: "Grocery deleted successfully" });

    } catch (error) {
        console.log("Error while deleteing KhataFlow User grocery", error);
        return res.status(500).json({ success: false, message: "Error while deleting KhataFlow User grocery" });
    }
})

module.exports = router;