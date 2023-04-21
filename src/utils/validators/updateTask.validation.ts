import { Joi } from "express-validation";

export const updateTaskValidation = {
    body: Joi.object({
      _id: Joi.string()
        .required(),
    title: Joi.string(),
    description: Joi.string(),
    isCompleted: Joi.boolean()
    }),
  }
