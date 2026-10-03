const mongoose = require("mongoose");

const formRowSchema = new mongoose.Schema({
    datetime: { type: Date, required: true },
    details: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["Withdrawl", "Deposit"], required: true },
});

const accountSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        email: { type: String, required: true },

        name: { type: String, required: true },
        withdrawl: { type: Number, default: 0 },
        deposit: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },

        formRows: [formRowSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
