import {
	Body,
	ConflictException,
	Controller,
	Get,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";

@Controller("users")
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	@Public()
	@Post("register")
	async register(@Body() createUserDto: CreateUserDto) {
		const existingUser = await this.userService.findByEmail(
			createUserDto.email,
		);
		if (existingUser) {
			throw new ConflictException("Email already exists");
		}

		const user = await this.userService.create(createUserDto);

		const payload = { sub: user.id, email: user.email };
		const access_token = this.jwtService.sign(payload);

		const { password, ...result } = user;
		return {
			...result,
			access_token,
		};
	}

	@UseGuards(JwtAuthGuard)
	@Get("profile")
	async getProfile(@Request() req) {
		const user = await this.userService.findById(req.user.id);
		if (!user) {
			return null;
		}
		const { password, ...result } = user;
		return result;
	}
}
