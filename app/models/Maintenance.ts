import mongoose from "mongoose";

const MaintenanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        monthlyAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        pendingAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid", "overdue"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Maintenance =
    mongoose.models.Maintenance ||
    mongoose.model("Maintenance", MaintenanceSchema);

export default Maintenance;