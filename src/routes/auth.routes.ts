import { Router } from 'express';
import UserController from '../controllers/user.contoller';
import UserService from '../services/user.service';
import TokenService from '../services/token.service';
import { validate } from 'express-validation';
import { loginValidation } from '../utils/validators/login.validation';
import checkAuth from '../middlewares/token.middleware';
import { authLimiter } from '../utils/limiters/auth.limiter';
import { logoutValidation } from '../utils/validators/logout.validation';

export default class AuthRoutes {
  public router = Router();
  private userController: UserController;
  private userService: UserService;
  private tokenService: TokenService;

  constructor() {
    this.userService = new UserService();
    this.tokenService= new TokenService(this.userService);
    this.userController = new UserController(this.userService, this.tokenService);
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post('/login', validate(loginValidation), this.userController.login);
    this.router.post('/registration', validate(loginValidation), this.userController.registration);
    this.router.post('/logout', checkAuth, validate(logoutValidation), authLimiter, this.userController.logout);
  }
}
