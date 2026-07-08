import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class PvpRepository {
    constructor(private readonly dataSource: DataSource) {}
}