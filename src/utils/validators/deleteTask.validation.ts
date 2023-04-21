import { Joi } from "express-validation";

export const deleteTaskValidation = {
    body: Joi.object({
      id: Joi.string()
        .required(),
    }),
  }
