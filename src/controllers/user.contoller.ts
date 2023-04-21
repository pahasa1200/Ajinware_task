import { NextFunction, Request, Response } from "express";
import UserService from "../services/user.service";
import ApiError from "../utils/api-error";
import TokenService from "../services/token.service";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { messages } from "../utils/messages";
import { TypedRequestBody } from "../middlewares/token.middleware";

export default class UserController {
  constructor(private readonly userService: UserService, private readonly tokenService: TokenService) {
    this.userService = new UserService();
    this.tokenService= new TokenService(this.userService);
  }

  public registration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const user = await this.userService.getUserByUsername(username);

      if (user) {
          throw ApiError.BadRequest(messages.auth.USER_EXISTS);
      }

      const apiKey = uuidv4();
      const hashPassword = await bcrypt.hash(password, 3);
      await this.userService.registration(username, hashPassword, apiKey);
      const refreshToken = await this.tokenService.generateRefreshToken(username);
      await this.tokenService.saveToken(username, refreshToken);
      return res.status(200).json({ message: messages.common.SUCCESS });
    } catch(error) {
        next(error);
    }
}

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const user = await this.userService.getUserByUsername(username);
      if (user) {
        const isPasswordEquals = await bcrypt.compare(password, user.password);
        if (isPasswordEquals) {
          const refreshToken = await this.tokenService.generateRefreshToken(username);
          const accessToken = await this.tokenService.generateAccessToken(username);

          await this.tokenService.saveToken(username, refreshToken);
          return res.status(200).json({ accessToken, refreshToken, apiKey: user.apiKey });
        }
      }
      throw ApiError.BadRequest(messages.auth.WRONG_PASSWORD_OR_USERNAME);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: TypedRequestBody, res: Response, next: NextFunction) => {
    try {
      let id;

      if (req.userDecodedData) {
        id = req.userDecodedData.id;
      } else {
        id = req.body;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        throw ApiError.BadRequest(messages.auth.USER_DOES_NOT_EXIST);
      }

      await this.tokenService.revokeRefreshToken(id);
      return res.status(200).json({ message: messages.auth.USER_LOGGED_OUT });
    } catch(error) {
      next(error);
    }
  }
}
