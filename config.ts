import * as dotenv from 'dotenv';
dotenv.config();

export const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME!
export const MYSQL_HOST = process.env.MYSQL_HOST!
export const MYSQL_USER = process.env.MYSQL_USER!
export const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD!
export const MYSQL_DB = process.env.MYSQL_DB!
export const MYSQL_PORT = process.env.MYSQL_PORT!