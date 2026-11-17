import mongoose from "mongoose";

export const MESSAGE_MAX_LENGTH = 2000;

/**
 * A message in a society's group chat.
 *
 * Messages are scoped to a society; only members of that society may read or
 * write. The sender's role is snapshotted at send time so the chat keeps
 * showing the role the person had when they wrote the message.
 */
const MessageSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Snapshotted at send time.
    senderRole: {
      type: String,
      enum: ["owner", "admin", "resident"],
      default: "resident",
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: MESSAGE_MAX_LENGTH,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ societyId: 1, createdAt: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;