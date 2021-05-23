import {Connection} from 'mongoose';
import {connectMongooseWithRetry} from './mongodb-connect';

// Get config from env
const mongoHost = process.env.MONGO_TEST_HOST || 'localhost';
const mongoPort = process.env.MONGO_TEST_PORT || 27017;

export async function connectTestMongoose(dbname: string): Promise<Connection> {
    const testUri = `mongodb://${mongoHost}:${mongoPort}/count-test-${dbname}?authSource=admin`;
    const connection = await connectMongooseWithRetry(1, testUri);
    if (!connection) {
        throw new Error('Mongoose could not connect');
    }
    return connection;
}
