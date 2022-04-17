import 'dotenv/config';

export const config = {
    version: process.env.APP_VERSION || 'local',
    port: parseInt(process.env.PORT || '4050', 10),
    corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN || '',
    sioAllowedOrigin: process.env.SIO_ALLOWED_ORIGIN || '',
    debugSocket: !!(process.env.DEBUG_SOCKET),

    mongoHost: process.env.MONGO_HOST || 'localhost',
    mongoPort: parseInt(process.env.MONGO_PORT || '27017', 10),
    mongoUser: process.env.MONGO_USER || '',
    mongoPass: process.env.MONGO_PASS || '',

    mongoTestHost: process.env.MONGO_TEST_HOST || 'localhost',
    mongoTestPort: parseInt(process.env.MONGO_TEST_PORT || '27017', 10),
};
