import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class ChallengeRequestRepository {
    constructor(private readonly dataSource: DataSource) {}
}