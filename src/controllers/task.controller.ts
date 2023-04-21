import { NextFunction, Response, Request } from "express";
import TaskService from "../services/task.service";
import { messages } from "../utils/messages";
import nodecache from "node-cache";
import ApiError from "../utils/api-error";

const tasksCashe = new nodecache({ stdTTL: 3599 });

export default class TaskController {
  constructor(private readonly taskService: TaskService) {
    this.taskService = new TaskService();
  }

  private updateCashe = async () => {
    const tasks = await this.taskService.getAllTasks();
    tasksCashe.set("todos", tasks);
    return tasks;
  }

  public addTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description } = req.body;
        await this.taskService.createTask(title, description);
        await this.updateCashe();
        return res.status(200).json({ message: messages.common.SUCCESS });
    } catch(error) {
        next(error);
    }
  }

  public deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        const task = this.taskService.getTask(id);

        if (!task) {
          throw ApiError.BadRequest(messages.errors.WRONG_ID);
        }
        await this.taskService.deleteTask(id);
        await this.updateCashe();
        return res.status(200).json({ msg: messages.common.SUCCESS });
    } catch(error) {
        next(error);
    }
  }

  public getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(tasksCashe.has('todos')) {
          return res.status(200).send(tasksCashe.get('todos'));
        } else {
          const tasks = await this.updateCashe();
          return res.status(200).json(tasks);
        }
    } catch(error) {
        next(error);
    }
  }

  public editTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newTasksData = req.body;
        const task = this.taskService.getTask(newTasksData._id);

        if (!task) {
          throw ApiError.BadRequest(messages.errors.WRONG_ID);
        }

        await this.taskService.updateTask(newTasksData._id, newTasksData);
        await this.updateCashe();
        return res.status(200).json({ message: messages.common.SUCCESS });
    } catch(error) {
        next(error);
    }
  }
}
