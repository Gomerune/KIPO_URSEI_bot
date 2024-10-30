import { IDBFormEdu } from "../../interfaces/DB/IDBFormEdu";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBFormEdu extends DB implements IDBEntity<IDBFormEdu> {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: string | number): Promise<IDBFormEdu | null> {
        return await this.get(`SELECT * FROM FormEdu WHERE id = ?`, [id]);
    }

    async setData(id: string | number, formEdu: IDBFormEdu): Promise<void> {
        return await this.set(`UPDATE FormEdu SET name = ? WHERE id = ?`, [formEdu.name, id]);
    }

    async deleteData(id: string | number): Promise<void> {
        return await this.delete(`DELETE FROM FormEdu WHERE id = ?`, [id]);
    }

    async addData(formEdu: IDBFormEdu): Promise<void> {
        try {
            await this.run(`
                INSERT OR IGNORE INTO FormEdu (id, name) 
                VALUES (?, ?)
            `, [formEdu.id, formEdu.name]);
        } catch (error) {
            console.error('Ошибка при добавлении данных в FormEdu:', error);
            throw error;
        }
    }

    async getAllData(): Promise<IDBFormEdu[]> {
        return await this.all(`SELECT * FROM FormEdu`);
    }
}