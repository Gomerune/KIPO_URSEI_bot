import { IDBCursGroup } from "../../interfaces/DB/IDBCursGroup";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBCursGroup extends DB implements IDBEntity<IDBCursGroup> {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: string | number): Promise<IDBCursGroup | null> {
        return await this.get(`SELECT * FROM CursGroup WHERE id = ?`, [id]);
    }

    async setData(id: string | number, cursGroup: IDBCursGroup): Promise<void> {
        return await this.set(`UPDATE CursGroup SET curs_id = ?, group_id = ?, form_edu_id = ? WHERE id = ?`, [cursGroup.curs_id, cursGroup.group_id, cursGroup.form_edu_id, id]);
    }

    async deleteData(id: string | number): Promise<void> {
        return await this.delete(`DELETE FROM CursGroup WHERE id = ?`, [id]);
    }

    async addData(cursGroup: IDBCursGroup): Promise<void> {
        try {
            console.log('Пытаемся добавить данные:', cursGroup);
            await this.run(`
                INSERT OR IGNORE INTO CursGroup (curs_id, group_id, form_edu_id) 
                VALUES (?, ?, ?)
            `, [cursGroup.curs_id, cursGroup.group_id, cursGroup.form_edu_id]);
            console.log('Данные успешно добавлены в CursGroup');
        } catch (error) {
            console.error('Ошибка при добавлении данных в CursGroup:', error);
            throw error;
        }
    }

    async getAllData(): Promise<IDBCursGroup[]> {
        return await this.all(`SELECT * FROM CursGroup`);
    }
}