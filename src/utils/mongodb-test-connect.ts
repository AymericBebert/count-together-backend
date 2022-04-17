import {Connection} from 'mongoose';
import {config} from '../config';
import {connectMongooseWithRetry} from './mongodb-connect';

export async function connectTestMongoose(dbname: string): Promise<Connection> {
    const testUri = `mongodb://${config.mongoTestHost}:${config.mongoTestPort}/count-test-${dbname}?authSource=admin`;
    const connection = await connectMongooseWithRetry(1, testUri);
    if (!connection) {
        throw new Error('Mongoose could not connect');
    }
    return connection;
}

export async function closeTestMongoose(connection: Connection) {
    await connection.dropDatabase();
    await connection.close(true).catch(() => console.warn(`Force close for db ${connection.db.databaseName}`));
}
