export interface RegisterInput {
  email: string;
  password: string;
}

export interface RegisterOutput {
  user: {
    id: string;
    email: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
}

export type AuthStatus = "unknown" | "authenticated" | "anonymous";







