import rateLimit from 'express-rate-limit';
import { messages } from '../messages';

export const authLimiter = rateLimit({
	windowMs: 5 * 1000,
	max: 1,
	message: { message: messages.errors.USED_MANY_TIMES },
	standardHeaders: true,
	legacyHeaders: false,
})
