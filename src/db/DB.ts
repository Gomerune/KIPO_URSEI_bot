import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';

export class DB {
    private db: sqlite3.Database;

    constructor(private dbPath: string) {
        if (!fs.existsSync(dbPath)) {
            this.db = new sqlite3.Database(dbPath);
            this.init();
        } else {
            this.db = new sqlite3.Database(dbPath);
        }
    }

    private async init(): Promise<void> {
        await this.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                username TEXT
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id INTEGER NOT NULL,
                day TEXT NOT NULL,
                lesson TEXT NOT NULL,
                time TEXT NOT NULL
            )
        `);
    }

    public async run(query: string, params: any[] = []): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(query, params, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
/*
    public async get<T>(query: string, params: any[] = []): Promise<T | undefined> {
        return new Promise<T | undefined>((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public async all<T>(query: string, params: any[] = []): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
*/
    public close(): void {
        this.db.close();
    }
}