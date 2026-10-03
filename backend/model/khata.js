const mongoose = require("mongoose");

const khataSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        email: { type: String, required: true },

        title: { type: String, required: true },
        date: { type: String, required: true },

        rows: [
            {
                description: String,
                qty: Number,
                unit: String,
                rate: Number,
                amount: Number,
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("KhataLedger", khataSchema);
