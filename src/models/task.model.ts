import { Schema, model } from "mongoose";
import ITask from "../types/ITask";

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true},
    description: { type: String, required: true},
    isCompleted: { type: Boolean, default: false},
}, { timestamps: true });

export default model('Task', TaskSchema);
