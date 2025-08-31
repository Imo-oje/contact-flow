export interface SerializedContact {
  id: string;
  name: string;
  phone: string;
  type: string;
  createdAt: string;
}

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  allowSharing: boolean;
}
