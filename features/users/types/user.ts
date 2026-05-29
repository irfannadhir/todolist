export type UserItem = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type UserPayload = {
  email: string;
  password: string;
};

export type UserUpdatePayload = Partial<UserPayload>;
