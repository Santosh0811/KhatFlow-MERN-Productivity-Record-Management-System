const mongoose = require("mongoose");

const todoFormSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },

        userName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3
        },

        email: {
            type: String,
            required: true,
            lowercase: true
        },

        eventName: {
            type: String,
            required: true,
            minlength: 3
        },

        date: {
            type: String,
            required: true,
        },

        todoContent: [
            {
                startTime: String,

                endTime: String,

                description: String,

                status: String,
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("TodoForm", todoFormSchema);
