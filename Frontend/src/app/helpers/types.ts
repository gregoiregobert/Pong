export type User = {
	id: number,
	login: string,
	hash: string,
	avatar: string,
	userstatus: string,
	friendlist: number[],
	friendrequests: FriendRequest[]
}

export type FriendRequest = {
	id: number,
	sentId: number,
	userId: number
}