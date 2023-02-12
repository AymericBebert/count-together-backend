import mongoose, {Connection} from 'mongoose';
import {config} from '../config';
import {errorString} from './error-string';

mongoose.set('strictQuery', true);

// MongoDB connection
const MONGODB_CONNECTION = `mongodb://${config.mongoHost}:${config.mongoPort}/count?authSource=admin`;

export async function connectMongooseWithRetry(maxTries = -1, uri?: string): Promise<Connection | null> {
    const connectUri = uri || MONGODB_CONNECTION;
    let tries = 0;

    while (tries < maxTries || maxTries < 0) {
        tries += 1;

        const mongooseConnect = await mongoose.connect(connectUri, {
            user: config.mongoUser,
            pass: config.mongoPass,
            connectTimeoutMS: 3000,
        }).catch(err => console.error(`Mongoose connection error with ${connectUri}: ${errorString(err)}`));

        if (mongooseConnect) {
            console.log(`Mongoose connected with URI ${connectUri}`);
            return mongooseConnect.connection;
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    return null;
}
