import { IDBCurs } from "../../interfaces/DB/IDBCurs";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBCurs extends DB implements IDBEntity<IDBCurs> {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: string | number): Promise<IDBCurs | null> {
        return await this.get(`SELECT * FROM Curs WHERE id = ?`, [id]);
    }

    async setData(id: string | number, curs: IDBCurs): Promise<void> {
        return await this.set(`UPDATE Curs SET name = ? WHERE id = ?`, [curs.name, id]);
    }

    async deleteData(id: string | number): Promise<void> {
        return await this.delete(`DELETE FROM Curs WHERE id = ?`, [id]);
    }

    async addData(curs: IDBCurs): Promise<void> {
        try {
            await this.run(`
                INSERT OR IGNORE INTO Curs (id, name) 
                VALUES (?, ?)
            `, [curs.id, curs.name]);
        } catch (error) {
            console.error('Ошибка при добавлении данных в Curs:', error);
            throw error;
        }
    }

    async getAllData(): Promise<IDBCurs[]> {
        return await this.all(`SELECT * FROM Curs`);
    }
}