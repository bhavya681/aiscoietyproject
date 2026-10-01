import mongoose from "mongoose";

const MaintenanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    // Set when the resident (or an admin) settles the due amount.
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "bank_transfer", "cash", "other"],
    },
  },
  {
    timestamps: true,
  }
);

// Every user-facing query filters by owner and due date.
MaintenanceSchema.index({ userId: 1, dueDate: -1 });

const Maintenance =
  mongoose.models.Maintenance ||
  mongoose.model("Maintenance", MaintenanceSchema);

export default Maintenance;
