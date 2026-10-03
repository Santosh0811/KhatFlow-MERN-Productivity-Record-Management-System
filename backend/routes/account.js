const express = require("express");
const router = express.Router();
const Account = require("../model/account");
const authUser = require("../middleware/authUser");
const Signup = require("../model/signup");

router.post("/createCustomer", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { name, withdrawl, deposit, balance, formRows, } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Please enter name" });
        }

        const createAccount = new Account({
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            name,
            withdrawl,
            deposit,
            balance,
            formRows,
        });

        await createAccount.save();

        return res.status(200).json({
            message: `${name} account created successfully`,
            data: createAccount,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating customer account",
        });
    }
})

router.get("/fetchCustomers", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const customers = await Account.find({ userId: user.userId });

        return res.status(200).json({
            success: true,
            data: customers, // ✅ always array
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching the customers",
        });
    }
})

router.get("/fetchCustomersDetails/:customerId", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { customerId } = req.params;

        const customers = await Account.findById(customerId);

        return res.status(200).json({
            success: true,
            data: customers, // ✅ always array
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching the customers",
        });
    }
})

router.put("/updateEntries", authUser, async (req, res) => {
    const isUserExist = await Signup.findOne({ userId: req.userId });

    if (!isUserExist) {
        return res.status(400).json({
            message: "Login required",
        });
    }

    const { id, datetime, details, amount, type } = req.body;

    if (!id || !datetime || !details || !amount || !type) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.formRows.push({ datetime: new Date(datetime), details, amount, type });

    account.withdrawl = account.formRows
        .filter(e => e.type === "Withdrawl")
        .reduce((s, e) => s + e.amount, 0);

    account.deposit = account.formRows
        .filter(e => e.type === "Deposit")
        .reduce((s, e) => s + e.amount, 0);

    account.balance = account.deposit - account.withdrawl;

    await account.save();

    res.json({ message: "Entry added successfully", account });
});


// DELETE /deleteEntry/:accountId/:entryId
router.delete("/deleteEntry/:accountId/:entryId", authUser, async (req, res) => {
    const isUserExist = await Signup.findOne({ userId: req.userId });

    if (!isUserExist) {
        return res.status(400).json({
            message: "Login required",
        });
    }

    const { accountId, entryId } = req.params;

    try {
        const account = await Account.findById({
            _id: accountId,
            userId: req.userId
        });
        if (!account) return res.status(404).json({ message: "Account not found" });

        // Remove entry
        account.formRows = account.formRows.filter(e => e._id.toString() !== entryId);

        // Recalculate totals
        account.withdrawl = account.formRows.filter(e => e.type === "Withdrawl").reduce((sum, e) => sum + e.amount, 0);
        account.deposit = account.formRows.filter(e => e.type === "Deposit").reduce((sum, e) => sum + e.amount, 0);
        account.balance = account.withdrawl - account.deposit;

        await account.save();

        res.json({ message: "Entry deleted successfully", account });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /editEntry/:accountId/:entryId
router.put("/editEntry/:accountId/:entryId", authUser, async (req, res) => {
    const isUserExist = await Signup.findOne({ userId: req.userId });

    if (!isUserExist) {
        return res.status(400).json({
            message: "Login required",
        });
    }

    const { accountId, entryId } = req.params;
    const { datetime, details, amount, type } = req.body;

    if (!datetime || !details || !amount || !type) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const account = await Account.findById({
            _id: accountId,
            userId: req.userId
        });
        if (!account) return res.status(404).json({ message: "Account not found" });

        const entry = account.formRows.id(entryId);
        if (!entry) return res.status(404).json({ message: "Entry not found" });

        // Update entry
        entry.datetime = new Date(datetime);
        entry.details = details;
        entry.amount = amount;
        entry.type = type;

        // Recalculate totals
        account.withdrawl = account.formRows.filter(e => e.type === "Withdrawl").reduce((sum, e) => sum + e.amount, 0);
        account.deposit = account.formRows.filter(e => e.type === "Deposit").reduce((sum, e) => sum + e.amount, 0);
        account.balance = account.deposit - account.withdrawl;

        await account.save();

        res.json({ message: "Entry updated successfully", account });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/deleteCustomer/:id", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({ message: "Login required" });
        }

        const { id } = req.params;

        const account = await Account.findOneAndDelete({
            _id: id,
            userId: req.userId, // 🔐 ownership check
        });

        if (!account) {
            return res.status(404).json({
                message: "Customer not found or unauthorized",
            });
        }

        return res.status(200).json({
            message: `${account.name} account deleted successfully`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Delete customer server error",
        });
    }
});

router.post("/updateCustomerName/:id", authUser, async (req, res) => {
    try {
        const user = await Signup.findOne({ userId: req.userId });

        if (!user) {
            return res.status(401).json({
                message: "Login required",
            });
        }

        const { editName } = req.body;
        const { id } = req.params;

        if (editName.length === 0) {
            return res.status(400).json({ message: "Customer name required" });
        }

        const updateCustName = await Account.findByIdAndUpdate({ _id: id }, { name: editName });

        if (!updateCustName) {
            return res.status(400).json({ message: "Failed to update cutomer name" });
        }

        return res.status(200).json({ message: "Customer name updated" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Change customer name Error" });
    }
})

module.exports = router;