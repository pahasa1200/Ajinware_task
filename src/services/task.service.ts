import TaskModel from "../models/task.model";
import ITask from "../types/ITask";

export default class TaskService {
    async createTask(title: string, description: string) {
       return await TaskModel.create({ title, description });
    }

    async updateTask(id: string, updatedData: ITask) {
        await TaskModel.updateOne({ _id: id }, { $set: updatedData });
    }

    async deleteTask(id: string) {
        await TaskModel.deleteOne({ _id: id });
    }

    async getAllTasks() {
        return await TaskModel.find();
    }

    async getTask(id: string) {
        return await TaskModel.findOne({ _id: id });
    }
}
