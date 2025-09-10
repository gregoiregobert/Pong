import { UserI } from "./user.interface";

export interface RoomI {
	id?: number;
	name?: string;
	description?: string;
	users?: UserI[];
	created_at?: Date;
	updated_at?: Date;
	public?: boolean;
	isPass?: boolean;
}
