import mongoose, {Model, Document, Query} from "mongoose";

export class BaseService<T extends Document> {
    protected model: Model<T>;
    protected populateFields: string | string[] = [];

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        const instance = new this.model(data);
        return instance.save();
    }

    async findAll(): Promise<T[]> {
        return this.applyPopulates(this.model.find()).exec();
    }

    async findById(id: string): Promise<T | null> {
        return this.applyPopulates(this.model.findById(id)).exec();
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id).exec();
        return result !== null;
    }

    private applyPopulates(query: Query<any, T>, ): Query<any, T> {
        if (Array.isArray(this.populateFields)) {
            // Aplica múltiplos populates
            this.populateFields.forEach(field => query.populate(field));
        } else {
            // Aplica um único populate
            query.populate(this.populateFields);
        }
        return query;
    }

}