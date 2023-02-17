export interface User {
  userId: string;
  socketId?: string;
}

export interface Room {
  roomId: string;
  host: User;
  users: User[];
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
