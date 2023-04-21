import dotenv from "dotenv";
import mongoose from "mongoose";
import app from './App'

dotenv.config();
const uri = process.env.MONGO_ULL;
const port = process.env.SERVER_PORT;

async function connect() {
    if (process.env.NODE_ENV !== 'test') {
        try {
            mongoose.Promise = global.Promise;
            await mongoose.connect(uri as string);
            console.log('Databased conected...');
        } catch (err) {
            console.log('Mongoose error', err);
        }
    }

    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })
}

connect();
