import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { IDBUser } from "../../interfaces/DB/DBUser";
import { DB } from "../DB";

export class DBUsers extends DB implements IDBEntity {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: string): Promise<IDBUser | null> {
        return await this.get(`SELECT * FROM users WHERE id = ?`, [id]);
    }

    async setData(id: string, user: any): Promise<void> {
        return await this.set(`UPDATE users SET username = ? WHERE id = ?`, [user.username, id]);
    }

    async deleteData(id: string): Promise<void> {
        return await this.delete(`DELETE FROM users WHERE id = ?`, [id]);
    }

    async addData(user: IDBUser): Promise<void> {
        await this.run(`INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)`, [user.id, user.username]);
    }
}