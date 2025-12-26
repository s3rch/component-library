import type { NextFunction, Request, Response } from "express";

import type { RegisterInputDto, LoginInputDto } from "../../../application/dto/auth";
import type { LoginUserUseCase } from "../../../application/use-cases/LoginUserUseCase";
import type { RegisterUserUseCase } from "../../../application/use-cases/RegisterUserUseCase";

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as RegisterInputDto;
      const output = await this.registerUser.execute(input);
      return res.status(201).json(output);
    } catch (err: unknown) {
      return next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as LoginInputDto;
      const output = await this.loginUser.execute(input);
      return res.status(200).json(output);
    } catch (err: unknown) {
      return next(err);
    }
  };
}


