import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/api-error';
import UserModel from '../models/user.model';

export interface TypedRequestBody extends Request {
  userDecodedData?: any;
}

async function checkAuth(req: TypedRequestBody, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    const apiKey = req.header("x-api-key");

    if (!authorization && !apiKey) {
      throw ApiError.UnauthorizedError();
    }

    if (authorization) {
      const token = authorization.split(' ')[1];
      const decodedData = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
      req.userDecodedData = decodedData;
      next();
    } else {
      const verifiedApiKey = await UserModel.findOne({ apiKey });

      if (!verifiedApiKey) {
          throw ApiError.UnauthorizedError();
      }

      next();
    }
  } catch (error) {
    next(error);
  }
}

export default checkAuth;
