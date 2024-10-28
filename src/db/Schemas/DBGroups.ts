import { IDBGroup } from "../../interfaces/DB/DBGroup";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBGroups extends DB implements IDBEntity {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: number): Promise<IDBGroup | null> {
        return await this.get(`SELECT * FROM groups WHERE id = ?`, [id]);
    }

    async setData(id: number, group: IDBGroup): Promise<void> {
        return await this.set(`UPDATE groups SET name = ? WHERE id = ?`, [group.name, id]);
    }

    async deleteData(id: number): Promise<void> {
        return await this.delete(`DELETE FROM groups WHERE id = ?`, [id]);
    }

    async addData(group: IDBGroup): Promise<void> {
        await this.run(`INSERT OR IGNORE INTO groups (id, name) VALUES (?, ?)`, [group.id, group.name]);
    }

}