import {Inject, Injectable} from '@nestjs/common';
import {eq} from "drizzle-orm";
import {users} from "../db/schema";
import type {DB} from "../types";

@Injectable()
export class UsersService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async findUserByUsername(username: string) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1)

        console.log(result)
        return result[0] ?? null
    }

    async createUser(username: string, password: string) {
        const result = await this.db
            .insert(users)
            .values({ username, password })
            .returning();

        return result[0];
    }
}
