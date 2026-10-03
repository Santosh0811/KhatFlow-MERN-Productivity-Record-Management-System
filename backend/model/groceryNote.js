const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        email: { type: String, required: true },

        title: { type: String, required: true },
        total: { type: Number, required: true },

        items: [
            {
                name: String,
                qty: Number,
                unit: Number,
                unitName: String,
                rate: Number,
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("GroceryNote", grocerySchema);
