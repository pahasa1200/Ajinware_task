import jwt from 'jsonwebtoken';
import UserService from "./user.service"
import ApiError from '../utils/api-error';
import { messages } from '../utils/messages';

export default class TokenService {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  public async generateAccessToken(username: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      throw ApiError.BadRequest(messages.auth.USER_DOES_NOT_EXIST);
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });

    return accessToken;
  }

  public async generateRefreshToken(username: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      throw ApiError.BadRequest(messages.auth.USER_DOES_NOT_EXIST);
    }

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
    return refreshToken;
  }

  public async saveToken(username: string, refreshToken: string) {
    return this.userService.insertRefreshToken(username, refreshToken);
  }

  public async revokeRefreshToken(id: string) {
    return await this.userService.revokeRefreshToken(id);
  }
}
