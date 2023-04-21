import { Joi } from "express-validation";

export const logoutValidation = {
    body: Joi.object({
      id: Joi.string()
    }),
}
