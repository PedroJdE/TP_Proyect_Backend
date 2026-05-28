import dotenv from 'dotenv';

dotenv.config();

const environment = {
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    MODE: process.env.MODE,
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
    URL_BACKEND: process.env.URL_BACKEND || 'http://localhost:3000'
};
console.log("Environment variables loaded:", environment);
export default environment;