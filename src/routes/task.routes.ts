import { Router } from 'express';
import TaskService from '../services/task.service';
import TaskController from '../controllers/task.controller';
import { validate } from 'express-validation';
import { updateTaskValidation } from '../utils/validators/updateTask.validation';
import { deleteTaskValidation } from '../utils/validators/deleteTask.validation';
import { addTaskValidation } from '../utils/validators/addNewTask.validation';
import checkAuth from '../middlewares/token.middleware';
import { taskLimiter } from '../utils/limiters/task.limiter';

export default class TaskRoutes {
  public router = Router();
  private taskController: TaskController;
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
    this.taskController = new TaskController(this.taskService);
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post('/task', checkAuth, taskLimiter, validate(addTaskValidation), this.taskController.addTask);
    this.router.delete('/task', checkAuth, taskLimiter, validate(deleteTaskValidation), this.taskController.deleteTask);
    this.router.patch('/task', checkAuth, taskLimiter, validate(updateTaskValidation), this.taskController.editTask);
    this.router.get('/task', checkAuth, taskLimiter, this.taskController.getAllTasks);
  }
}
