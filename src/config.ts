import 'dotenv/config';

export const config = {
    version: process.env.APP_VERSION || 'local',
    port: parseInt(process.env.PORT || '4050', 10),
    corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN || '',
    sioAllowedOrigin: process.env.SIO_ALLOWED_ORIGIN || '',
    debugSocket: !!(process.env.DEBUG_SOCKET),

    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/count?authSource=admin',
    mongoTestURL: process.env.MONGO_TEST_URL || 'mongodb://localhost:27017/count-test-PLACEHOLDER?authSource=admin',

    mongoTestHost: process.env.MONGO_TEST_HOST || 'localhost',
    mongoTestPort: parseInt(process.env.MONGO_TEST_PORT || '27017', 10),
};
