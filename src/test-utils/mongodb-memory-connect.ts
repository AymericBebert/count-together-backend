import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';

export async function connectMongooseWithRetry(maxTries = -1): Promise<boolean> {

    mongoose.Promise = Promise;

    const mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();

    let tries = 0;

    while (tries < maxTries || maxTries < 0) {
        tries += 1;

        const connection = await mongoose.connect(mongoUri, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            connectTimeoutMS: 3000,
        }).catch(err => console.error(`Mongoose connection error with ${mongoUri}: ${err}`));

        if (connection) {
            return true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    return false;
}
