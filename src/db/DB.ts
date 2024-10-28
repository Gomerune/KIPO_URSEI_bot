import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { IAPIData } from '../interfaces/UresiAPI/IAPIData';
import { IAPIGroup } from '../interfaces/UresiAPI/IAPIGroup';
import * as cliProgress from 'cli-progress';

export class DB {
    protected db: sqlite3.Database;

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
                id INTEGER PRIMARY KEY NOT NULL UNIQUE,
                username TEXT
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS user_group (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(group_id) REFERENCES groups(id)
            )
        `);

        await this.run(`
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY NOT NULL UNIQUE,
                name TEXT
            )
        `);

        await this.populateGroups();
    }

    protected async run(query: string, params: any[] = []): Promise<void> {
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

    protected async get(query: string, params: any[] = []): Promise<any | undefined> {
        return new Promise<any | undefined>((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    private async all(query: string, params: any[] = []): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    protected async set(query: string, params: any[]): Promise<void> {
        await this.run(query, params);
    }

    protected async delete(query: string, params: any[]): Promise<void> {
        await this.run(query, params);
    }

    private async populateGroups(): Promise<void> {
        const url = "https://api.ursei.su/public/schedule/rest/GetGSSchedIniData";
        const bar = new cliProgress.SingleBar({
            format: 'Создание базы данных [{bar}] {percentage}% | {value}/{total}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
    
        try {
            const response = await fetch(url);
            const data: IAPIData = await response.json();
            const groups: IAPIGroup[] = flattenGroups(data);
    
            bar.start(groups.length, 0);
    
            for (const group of groups) {
                await this.run(`
                    INSERT OR IGNORE INTO groups (id, name) VALUES (?, ?)
                `, [group.GS_ID, group.GSName]);
                bar.increment();
            }
    
            bar.stop();
            console.log('Создание базы данных завершено');
        } catch (e) {
            console.error('Ошибка при получении данных:', e);
            bar.stop();
        }
    }

    public async validateDatabase(): Promise<void> {
        const requiredTables = ['users', 'user_group', 'groups'];
        const missingTables: string[] = [];

        for (const table of requiredTables) {
            const row = await this.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table]);
            if (!row) {
                missingTables.push(table);
            }
        }

        if (missingTables.length > 0) {
            console.error(`Отсутствуют таблицы: ${missingTables.join(', ')}`);
            await this.init();
        } else {
            console.log('\x1b[32mВсе необходимые таблицы присутствуют.\x1b[0m');
        }

        const url = "https://api.ursei.su/public/schedule/rest/GetGSSchedIniData";
        try {
            const response = await fetch(url);
            const data: IAPIData = await response.json();
            const groups: IAPIGroup[] = flattenGroups(data);

            const dbGroups = await this.all(`SELECT id FROM groups`);
            const dbGroupIds = dbGroups.map(group => group.id);

            const missingGroups = groups.filter(group => !dbGroupIds.includes(group.GS_ID));

            if (missingGroups.length > 0) {
                console.error(`Отсутствуют группы в базе данных: ${missingGroups.map(g => g.GSName).join(', ')}`);
                await this.populateGroups()
            } else {
                console.log('\x1b[32mВсе группы из API присутствуют в базе данных.\x1b[0m');
            }
        } catch (e) {
            console.error('Ошибка при получении данных из API:', e);
        }
    }
}

function flattenGroups(data: IAPIData): IAPIGroup[] {
    const result: IAPIGroup[] = [];

    data.FormEdu.forEach(formEdu => {
        formEdu.arr.forEach(course => {
            course.arr.forEach(group => {
                result.push({
                    id: group.id,
                    GS_ID: group.GS_ID,
                    GSName: group.GSName
                });
            });
        });
    });

    return result;
}