import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { users } from "../schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { hashPassword } from "../utils/crypto.util";

@Injectable()
export class UserService {
	constructor(private readonly databaseService: DatabaseService) {}

	async findByEmail(email: string) {
		const db = this.databaseService.getDB();
		const result = await db.select().from(users).where(eq(users.email, email));
		return result[0];
	}

	async findById(id: string) {
		const db = this.databaseService.getDB();
		const result = await db.select().from(users).where(eq(users.id, id));
		return result[0];
	}

	async create(createUserDto: CreateUserDto) {
		const db = this.databaseService.getDB();
		const hashedPassword = await hashPassword(createUserDto.password, 10);
		const result = await db
			.insert(users)
			.values({
				email: createUserDto.email,
				password: hashedPassword,
			})
			.returning();
		return result[0];
	}
}
