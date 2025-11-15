const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'shoppn',
                charset: 'utf8mb4_unicode_ci'
            });
            console.log('Connected to MySQL database');
            return this.connection;
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }

    async getConnection() {
        if (!this.connection) {
            await this.connect();
        }
        return this.connection;
    }

    async closeConnection() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }
}


module.exports = new Database();
