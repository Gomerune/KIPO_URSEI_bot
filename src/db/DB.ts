import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { IGroup } from './interfaces/DBGroup'; 
import { IUser } from './interfaces/DBUsers';
import { IUserGroup } from './interfaces/DBUserGroup';

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
            CREATE TABLE IF NOT EXISTS userGroup (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(group_id) REFERENCES groups(id)
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id INTEGER NOT NULL UNIQUE,
                name TEXT
            )
        `);

       
        await this.populateGroups();
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

    public async get<T>(query: string, params: any[] = []): Promise<T | undefined> {
        return new Promise<T | undefined>((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as T | undefined);
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
                    resolve(rows as T[]);
                }
            });
        });
    }

    public close(): void {
        this.db.close();
    }

    public async addUser(user_id: number, username: string): Promise<void> {
        await this.run(`
            INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)
        `, [user_id, username]);
    }

    public async getUserById(user_id: number): Promise<IUser | undefined> {
        return this.get<IUser>(`
            SELECT * FROM users WHERE user_id = ?
        `, [user_id]);
    }

    public async getAllUsers(): Promise<IUser[]> {
        return this.all<IUser>(`
            SELECT * FROM users
        `);
    }


    public async addUserGroup(group_id: number, user_id: number): Promise<void> {
        await this.run(`
            INSERT OR IGNORE INTO userGroup (group_id, user_id) VALUES (?, ?)
        `, [group_id, user_id]);
    }

    public async getUserGroups(user_id: number): Promise<IUserGroup[]> {
        return this.all<IUserGroup>(`
            SELECT * FROM userGroup WHERE user_id = ?
        `, [user_id]);
    }


    public async addGroup(group_id: number, name: string): Promise<void> {
        await this.run(`
            INSERT OR IGNORE INTO groups (group_id, name) VALUES (?, ?)
        `, [group_id, name]);
    }

    public async getGroupById(group_id: number): Promise<IGroup | undefined> {
        return this.get<IGroup>(`
            SELECT * FROM groups WHERE group_id = ?
        `, [group_id]);
    }

    public async getAllGroups(): Promise<IGroup[]> {
        return this.all<IGroup>(`
            SELECT * FROM groups
        `);
    }

    public async getGroupByName(name: string): Promise<IGroup | undefined> {
        return this.get<IGroup>(`
            SELECT * FROM groups WHERE name = ?
        `, [name]);
    }

    private async populateGroups(): Promise<void> {
        const url = "https://api.ursei.su/public/schedule/rest/GetGSSchedIniData";
        try {
            const response = await fetch(url);
            const data: Data = await response.json();
            const groups: Group[] = flattenGroups(data);

            for (const group of groups) {
                await this.addGroup(group.GS_ID, group.GSName);
            }
        } catch (e) {
            console.error('Ошибка при получении данных:', e);
        }
    }
}

interface Group {
    GS_ID: number;
    GSName: string;
}

interface FormEdu {
    FormEdu_ID: number;
    FormEduName: string;
    arr: Course[];
}

interface Course {
    Curs: number;
    arr: Group[];
}

interface Data {
    FormEdu: FormEdu[];
}

function flattenGroups(data: Data): Group[] {
    const result: Group[] = [];

    data.FormEdu.forEach(formEdu => {
        formEdu.arr.forEach(course => {
            course.arr.forEach(group => {
                result.push({
                    GS_ID: group.GS_ID,
                    GSName: group.GSName
                });
            });
        });
    });

    return result;
}