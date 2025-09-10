import { UserI } from "src/chat/model/user.interface"


export interface ConnectedUserI {
  id?: number;
  socketId: string;
  user: UserI;
}