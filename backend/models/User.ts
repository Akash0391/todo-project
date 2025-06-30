import mongoose , { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  notifications: {
    email: boolean;
  }
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
  },
});

export const User = mongoose.model<IUser>("User", userSchema);