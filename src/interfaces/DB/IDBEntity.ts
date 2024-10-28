export interface IDBEntity {
    getData(id: string | number): Promise<any | null>;
    setData(id: string | number, entity: any): Promise<void>;
    deleteData(id: string | number): Promise<void>;
    addData(entity: any): Promise<void>;
}