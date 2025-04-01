import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { comparePassword } from "../utils/crypto.util";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.userService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const { password: _, ...result } = user;
		return result;
	}

	async login(loginDto: LoginDto) {
		const user = await this.validateUser(loginDto.email, loginDto.password);
		const payload = { sub: user.id, email: user.email };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
