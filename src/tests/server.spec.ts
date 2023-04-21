import { connectMongo, clearMongo, closeMongo } from "./db";
import request from "supertest";
import app from '../App'
import UserModel from "../models/user.model";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { messages } from "../utils/messages";
import nodecache from "node-cache";
import TaskService from "../services/task.service";

const agent = request.agent(app);
dotenv.config();
beforeAll(async () => await connectMongo());
beforeEach(async () => await clearMongo());
afterAll(async () => await closeMongo());

const tasksCache = new nodecache({ stdTTL: 3599 })
const taskService = new TaskService();

// turn off limiters before test
describe("Auth", () => {
describe('Registration', () => {
      test('should register a new user', async () => {
        const res = await request(app).post('/registration').send({
          username: 'testuser',
          password: 'testpassword',
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: messages.common.SUCCESS });

        const user = await UserModel.findOne({ username: 'testuser' });
        expect(user).toBeDefined();
        expect(user?.username).toBe('testuser');
      });

      test('should throw an error if the user already exists', async () => {
        await UserModel.create({
          username: 'testuser',
          password: 'testpassword',
        });

        const res = await request(app).post('/registration').send({
          username: 'testuser',
          password: 'testpassword',
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: messages.auth.USER_EXISTS, errors: [] });
      });

      test('should throw an error if the request body is missing', async () => {
        const res = await request(app).post('/registration').send({});
        expect(res.status).toBe(400);
      });
  });

  describe('Login', () => {
    test('should return 200 and access token and refresh token for valid credentials', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const apiKey = 'testapikey';

      const hashPassword = await bcrypt.hash(password, 3);
      await UserModel.create({ username, password: hashPassword, apiKey });

      const response = await agent.post('/login').send({ username, password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('apiKey', apiKey);
    });

    test('with incorrect username should return 400 Bad Request', async () => {
      const username = 'testuser';
      const password = 'testpassword';

      const response = await agent.post('/login').send({ username, password });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', messages.auth.WRONG_PASSWORD_OR_USERNAME);
    });

    test('with incorrect password should return 400 Bad Request', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const apiKey = 'testapikey';

      const hashPassword = await bcrypt.hash(password, 3);
      await UserModel.create({ username, password: hashPassword, apiKey });

      const response = await agent.post('/login').send({ username, password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', messages.auth.WRONG_PASSWORD_OR_USERNAME);
    });

    describe("Logout", () => {
      let token: string;
      let user: any;
      beforeAll(async () => {
        await agent.post("/registration").send({
          username: "testuser",
          password: "testpassword",
        });
        const res = await agent.post("/login").send({
          username: "testuser",
          password: "testpassword",
        });
        token = res.body.accessToken;
        user = await UserModel.findOne({ username: "testuser" });
      });

      test("Successful logout", async () => {
        const res = await agent
          .post("/logout")
          .send({ id: user._id })
          .auth(token, { type: "bearer" })
          .expect(200);

        expect(res.body.message).toBe(messages.auth.USER_LOGGED_OUT);

      });

      test("Failed logout with invalid refresh token ID", async () => {
        const res = await agent
          .post("/logout")
          .send({ id: "invalid_refresh_token_id" })
          .expect(401);

        expect(res.body.message).toBe(messages.errors.USER_IS_NOT_AUTHORIZED);
      });
    });
  });
});

  describe('Tasks', () => {
    let token: string;
    let user: any;
    afterEach(async () => {
      tasksCache.flushAll();
    });

    beforeAll(async () => {
      await agent.post("/registration").send({
        username: "testuser",
        password: "testpassword",
      });
      const res = await agent.post("/login").send({
        username: "testuser",
        password: "testpassword",
      });
      token = res.body.accessToken;
      user = await UserModel.findOne({ username: "testuser" });
    });

    describe('Delete task', () => {
      let task: any;
      beforeAll(async () => {
        task = await taskService.createTask('Test', 'Test');
      });

      it('should delete a task', async () => {
        const res = await agent
          .delete(`/task`)
          .send({ id: task._id })
          .auth(token, { type: "bearer" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: messages.common.SUCCESS });

        const tasks = tasksCache.get('todos') ?? await taskService.getAllTasks();
        expect(tasks).toHaveLength(0);
      });

      it('should throw an error if task id is invalid', async () => {
        const res = await request(app)
          .delete(`/task`)
          .auth(token, { type: "bearer" });

        expect(res.status).toBe(400);
      });
    });

    describe('Edit task', () => {
      let taskId: any;

      beforeAll(async () => {
        const task = await taskService.createTask('Test', 'Test');
        taskId = task._id;
      });

      it('should update an existing task', async () => {
        const res = await agent
          .patch(`/task`)
          .send({
            _id: taskId,
            title: 'Updated Test Task',
            description: 'Updated Test Description',
          })
          .auth(token, { type: 'bearer' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: messages.common.SUCCESS });
      });

      it('should not update an existing task', async () => {
        const res = await agent
          .patch(`/task`)
          .send({
            _id: taskId,
            titl: 'Updated Test Task',
            description: 'Updated Test Description',
          })
          .auth(token, { type: 'bearer' });

        expect(res.status).toBe(400);
      });
    });

    describe('Get all tasks', () => {
      it('should return all tasks', async () => {
        const res = await request(app)
          .get('/task')
          .auth(token, { type: 'bearer' });

        expect(res.status).toBe(200);
      });
    });

    describe('Add task', () => {
      it('should add a new task', async () => {
        const res = await agent
        .post('/task')
        .send({
          title: 'Test',
          description: 'Test',
        })
        .auth(token, { type: "bearer" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: messages.common.SUCCESS });

        const tasks = tasksCache.get('todos') ?? await taskService.getAllTasks();
        expect(tasks).toHaveLength(1);
      });

      it('should throw an error if title is missing', async () => {
        const res = await request(app).post('/task').send({
          description: 'Test Description',
        }).auth(token, { type: "bearer" });

        expect(res.status).toBe(400);
      });

      it('should throw an error if description is missing', async () => {
        const res = await request(app).post('/task').send({
          title: 'Test Task',
        }).auth(token, { type: "bearer" });

        expect(res.status).toBe(400);
      });
    });
  });
