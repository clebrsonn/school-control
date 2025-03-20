import mongoose from "mongoose";
import {logger} from "../utils/Logger";
import {Config} from "../utils/Config";

export class Database {
    private static instance: Database;

    private constructor() {
        mongoose.set('debug', (collectionName, method, query, doc) => {
            logger.info({
                collectionName,
                method,
                query,
                doc: doc || undefined,
            });
        });

        mongoose.connect(Config.DB_URI).then(() => {
            logger.debug('Connected to MongoDB');
        }).catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });

        mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.info('Mongoose disconnected');
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async closeConnection(): Promise<void> {
        await mongoose.connection.close();
        logger.info('Mongoose connection closed');
    }

    public getConnectionStatus(): string {
        const status = mongoose.connection.readyState;
        switch (status) {
            case 0:
                return 'disconnected';
            case 1:
                return 'connected';
            case 2:
                return 'connecting';
            case 3:
                return 'disconnecting';
            default:
                return 'unknown';
        }
    }
}