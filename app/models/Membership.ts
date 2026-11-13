import mongoose from "mongoose";

export const MEMBERSHIP_ROLES = ["owner", "admin", "resident"] as const;

export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const MEMBERSHIP_STATUSES = ["active", "invited"] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/**
 * Joins a user to a society.
 *
 * A user may hold many memberships (one per society), which is what lets a
 * resident belong to multiple societies at the same time. The pair
 * (userId, societyId) is unique, so a user can never be added twice.
 */
const MembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    role: {
      type: String,
      enum: MEMBERSHIP_ROLES,
      default: "resident",
    },

    status: {
      type: String,
      enum: MEMBERSHIP_STATUSES,
      default: "active",
    },

    // Flat / unit number within this specific society.
    flat: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

MembershipSchema.index({ userId: 1, societyId: 1 }, { unique: true });
MembershipSchema.index({ societyId: 1 });

const Membership =
  mongoose.models.Membership ||
  mongoose.model("Membership", MembershipSchema);

export default Membership;