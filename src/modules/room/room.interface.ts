export interface User {
  UserId: string;
  SocketId?: string;
}

export interface Room {
  RoomId: string;
  Host: User;
  Users: User[];
}

export interface Message {
  User: User;
  TimeSent: string;
  Message: string;
  RoomId: string;
}

export interface ServerToClientEvents {
  chat: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (e: Message) => void;
  join_room: (e: { User: User; RoomId: string }) => void;
}
