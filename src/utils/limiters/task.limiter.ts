import rateLimit from 'express-rate-limit';
import { messages } from '../messages';

export const taskLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 3,
	message: { message: { message: messages.errors.USED_MANY_TIMES } },
	standardHeaders: true,
	legacyHeaders: false,
})
