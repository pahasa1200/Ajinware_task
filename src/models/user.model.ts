import { Schema, model } from "mongoose";
import IUser from "../types/IUser";

const UserSchema = new Schema<IUser>({
    username: { type: String, unique: true, required: true},
    password: { type: String, required: true},
    apiKey: { type: String },
    jwtToken: { type: String},
}, { timestamps: true });

export default model('User', UserSchema);
