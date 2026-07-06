import { DataSource } from "typeorm";

export class RoomManager {
    constructor(private readonly dataSource: DataSource) {}
}