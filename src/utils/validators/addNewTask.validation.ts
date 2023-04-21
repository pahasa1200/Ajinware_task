import { Joi } from "express-validation";

export const addTaskValidation = {
    body: Joi.object({
    title: Joi.string()
        .required(),
    description: Joi.string()
        .required(),
    }),
  }
