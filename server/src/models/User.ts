import mongoose, { Schema, type Document } from "mongoose";

export type UserRole = "customer" | "agent" | "supervisor" | "admin";
export type UserLanguage = "en" | "hi" | "hinglish";
export type UserStatus = "active" | "suspended";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  preferredLanguage: UserLanguage;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Ensures password hash is excluded from query results by default
    },
    role: {
      type: String,
      enum: ["customer", "agent", "supervisor", "admin"],
      default: "customer",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "hinglish"],
      default: "en",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
