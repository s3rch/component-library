export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtProvider {
  sign(payload: JwtPayload, options?: { expiresIn: string }): string;
  verify(token: string): JwtPayload;
}


