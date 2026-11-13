import mongoose from "mongoose";

/**
 * A residential society / housing community.
 *
 * Every account belongs to one or more societies through a Membership row.
 * The creator becomes the `owner` member of the society they create.
 */
const SocietySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // URL-safe identifier derived from the name.
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Short code residents type to join an existing society.
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    // Default monthly maintenance used when the society raises a charge.
    monthlyMaintenance: {
      type: Number,
      default: 4000,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Society =
  mongoose.models.Society || mongoose.model("Society", SocietySchema);

export default Society;