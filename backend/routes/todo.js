const express = require("express");
const router = express.Router();
const TodoForm = require("../model/todoForm");
const authUser = require("../middleware/authUser");
const Signup = require("../model/signup");

router.post("/submitTodoForm", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const { eventName, date } = req.body;

        if (!eventName || !date) {
            return res.status(400).json({ message: "All inputs are required", });
        }

        if (eventName.length <= 3) {
            return res.status(400).json({ message: "Eventname should be greater than 3words", });
        }

        const saveTodoForm = new TodoForm({ userId: isUserExist.userId, userName: isUserExist.userName, email: isUserExist.email, eventName: eventName, date: date });

        await saveTodoForm.save();

        return res.status(200).json({ message: "Todo saved successful" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in submission of todo form",
        });
    }
})

router.post("/addTodoForm/:eventId", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const { eventId } = req.params;
        const { startTime, endTime, description, status } = req.body;

        if (!startTime || !endTime || !description || !status) {
            return res.status(400).json({
                message: "All inputs are required",
            });
        }

        await TodoForm.findByIdAndUpdate(
            { _id: eventId },
            {
                $push: {
                    todoContent: {
                        startTime,
                        endTime,
                        description,
                        status: status || "pending",
                    }
                }
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({ message: "Todo updated successful" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in add a todo",
        });
    }
})

router.put("/updateTodo/:eventId/:todoId", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const { eventId, todoId } = req.params;
        const { startTime, endTime, description } = req.body;

        if (!startTime || !endTime || !description) {
            return res.status(400).json({
                message: "All inputs are required",
            });
        }

        const updated = await TodoForm.findOneAndUpdate(
            {
                _id: eventId,
                "todoContent._id": todoId
            },
            {
                $set: {
                    "todoContent.$.startTime": startTime,
                    "todoContent.$.endTime": endTime,
                    "todoContent.$.description": description,
                }
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json({ message: "Status updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in updation of todo",
        });
    }
})

router.put("/updateeventUpdateForm/:eventId", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const { eventId } = req.params;
        const { eventName, date } = req.body;

        if (!eventName) {
            return res.status(400).json({
                message: "Event Name required",
            });
        }

        if (!date) {
            return res.status(400).json({
                message: "Date required",
            });
        }

        const updated = await TodoForm.findOneAndUpdate(
            {
                _id: eventId
            },
            {
                eventName,
                date
            },
            { returnDocument: "after" }
        );

        if (!updated) {
            return res.status(404).json({ message: "Event name or date not updated" });
        }

        res.status(200).json({ message: "Event name & date updated" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in updation of todo event name & date",
        });
    }
})

router.put("/updateStatus/:eventItemId/:todoId", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const { eventItemId, todoId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updated = await TodoForm.findOneAndUpdate(
            {
                _id: eventItemId,
                "todoContent._id": todoId
            },
            {
                $set: {
                    "todoContent.$.status": status
                }
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json({ message: "Status updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/readTodoForm", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const fetchTodo = await TodoForm.find({ userId: isUserExist.userId });

        if (!fetchTodo) {
            return res.status(404).json({ message: "No Todo found" });
        }

        return res.status(200).json({ fetchTodo, message: "Todo saved successful" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in fetching todo form",
        });
    }
})

router.delete("/todoDelete/:eventItemId/:todoId", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const { eventItemId, todoId } = req.params;

        const deleted = await TodoForm.findByIdAndUpdate(
            { _id: eventItemId, userId: req.userId },
            { $pull: { todoContent: { _id: todoId } } },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({ message: "Todo not deleted" });
        }

        res.status(200).json({ message: "Todo deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in delete todo",
        });
    }
})

router.delete("/eventDelete/:id", authUser, async (req, res) => {
    try {
        const isUserExist = await Signup.findOne({ userId: req.userId });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Login required",
            });
        }

        const { id } = req.params;

        const deleted = await TodoForm.findByIdAndDelete(
            { _id: id },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({ message: "Todo Event not deleted" });
        }

        res.status(200).json({ message: "Todo Event deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error in delete event todo",
        });
    }
})

module.exports = router;