export type UserItem = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type UserPayload = {
  name: string;
  email: string;
  password: string;
};

export type UserUpdatePayload = Partial<UserPayload>;
