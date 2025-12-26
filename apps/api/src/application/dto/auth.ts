export interface RegisterInputDto {
  email: string;
  password: string;
}

export interface RegisterOutputDto {
  user: {
    id: string;
    email: string;
  };
}

export interface LoginInputDto {
  email: string;
  password: string;
}

export interface LoginOutputDto {
  token: string;
}


