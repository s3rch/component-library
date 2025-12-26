import { AppError } from "../errors/AppError";
import type { RegisterInputDto, RegisterOutputDto } from "../dto/auth";
import type { PasswordHasher } from "../ports";
import type { UserRepository } from "../../domain/repositories/UserRepository";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: RegisterInputDto): Promise<RegisterOutputDto> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError({
        statusCode: 409,
        code: "CONFLICT",
        message: "Email already registered"
      });
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({ email: input.email, passwordHash });

    return {
      user: {
        id: user.id,
        email: user.email
      }
    };
  }
}


