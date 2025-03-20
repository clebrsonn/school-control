import dotenv from "dotenv";

dotenv.config();

export class Config {
    static readonly JWT_SECRET: string = process.env.JWT_SECRET || "your_default_secret";
    static readonly DB_URI: string = process.env.MONGO_URL || "mongodb://localhost:27017/mydb";
    static readonly PORT: number = parseInt(process.env.PORT || "5000", 10);
    static readonly NODE_ENV: string = process.env.NODE_ENV || "development";

    static readonly TOKEN_EXPIRATION: string = process.env.TOKEN_EXPIRATION || '1000';
}