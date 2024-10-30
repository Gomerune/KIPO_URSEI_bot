import { IDBUser } from "../../interfaces/DB/IDBUser";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBUsers extends DB implements IDBEntity<IDBUser> {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: string | number): Promise<IDBUser | null> {
        return await this.get(`SELECT * FROM Users WHERE id = ?`, [id]);
    }

    async setData(id: string | number, user: IDBUser): Promise<void> {
        return await this.set(`UPDATE Users SET username = ? WHERE id = ?`, [user.username, id]);
    }

    async deleteData(id: string | number): Promise<void> {
        return await this.delete(`DELETE FROM Users WHERE id = ?`, [id]);
    }

    async addData(user: IDBUser): Promise<void> {
        try {
            await this.run(`
                INSERT OR IGNORE INTO Users (id, username) 
                VALUES (?, ?)
            `, [user.id, user.username]);
        } catch (error) {
            console.error('Ошибка при добавлении данных в Users:', error);
            throw error;
        }
    }

    async getAllData(): Promise<IDBUser[]> {
        return await this.all(`SELECT * FROM Users`);
    }
}