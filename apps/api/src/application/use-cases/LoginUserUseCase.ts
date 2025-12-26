import { AppError } from "../errors/AppError";
import type { LoginInputDto, LoginOutputDto } from "../dto/auth";
import type { JwtProvider, PasswordHasher } from "../ports";
import type { UserRepository } from "../../domain/repositories/UserRepository";

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtProvider: JwtProvider
  ) {}

  async execute(input: LoginInputDto): Promise<LoginOutputDto> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    const ok = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    const token = this.jwtProvider.sign(
      { sub: user.id, email: user.email },
      { expiresIn: "1h" }
    );
    return { token };
  }
}


