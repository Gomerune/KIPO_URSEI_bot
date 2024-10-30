export interface IDBEntity<T> {
    getData(id: string | number): Promise<T | null>;
    setData(id: string | number, entity: T): Promise<void>;
    deleteData(id: string | number): Promise<void>;
    addData(entity: T): Promise<void>;
    getAllData(): Promise<T[]>;
}