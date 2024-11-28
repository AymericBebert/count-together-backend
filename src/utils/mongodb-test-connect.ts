import mongoose, {Connection} from 'mongoose';
import {config} from '../config';
import {errorString} from './error-string';

export async function connectTestMongoose(dbname: string): Promise<Connection> {
    const testUri = config.mongoTestURL.replace('PLACEHOLDER', dbname);

    mongoose.set('strictQuery', true);

    const mongooseConnect = await mongoose.connect(testUri, {
        // connectTimeoutMS: 30_000,
        // socketTimeoutMS: 30_000,
        bufferCommands: false,
        autoIndex: false,
    }).catch(err => console.error(`Mongoose connection error with ${testUri}: ${errorString(err)}`));

    if (!mongooseConnect) {
        throw new Error('Mongoose could not connect');
    }
    return mongooseConnect.connection;
}

export async function closeTestMongoose(connection: Connection) {
    await connection.dropDatabase();
    await connection.close(true).catch(() => console.warn(`Force close for db ${connection.db?.databaseName}`));
}
