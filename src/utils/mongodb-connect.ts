import mongoose, {Connection} from 'mongoose';

// Get config from env
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;

// MongoDB connection
const MONGODB_CONNECTION = `mongodb://${mongoHost}:${mongoPort}/count?authSource=admin`;

export async function connectMongooseWithRetry(maxTries = -1, uri?: string): Promise<Connection | null> {
    const connectUri = uri || MONGODB_CONNECTION;
    let tries = 0;

    while (tries < maxTries || maxTries < 0) {
        tries += 1;

        const mongooseConnect = await mongoose.connect(connectUri, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
            connectTimeoutMS: 3000,
        }).catch(err => console.error(`Mongoose connection error with ${connectUri}: ${err}`));

        if (mongooseConnect) {
            console.log(`Mongoose connected with URI ${connectUri}`);
            return mongooseConnect.connection;
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    return null;
}
