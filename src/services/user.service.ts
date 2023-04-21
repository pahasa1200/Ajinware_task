import UserModel from "../models/user.model";

class UserService {
  async registration(username: string, password: string, apiKey: string) {
    await UserModel.create({ username, password, apiKey });
  }

  async getUserByUsername(username: string) {
    return await UserModel.findOne({ username });
  }

  async getUserById(id: string) {
    return await UserModel.findOne({ _id: id });
  }

  async insertRefreshToken(username: string, token: string) {
    await UserModel.findOneAndUpdate({ username }, { jwtToken: token });
  }

  async revokeRefreshToken(id: string) {
    await UserModel.findOneAndUpdate({ _id: id }, { jwtToken: null });
  }
}

export default UserService;
