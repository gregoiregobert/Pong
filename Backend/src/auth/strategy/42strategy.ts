import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import { Strategy } from "passport-42";

export class FortytwoStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			clientID: process.env.FOURTYTWO_CLIENT_ID,
            clientSecret: process.env.FOURTYTWO_CLIENT_SECRET,
            callbackURL: process.env.FOURTYTWO_CALLBACK_URL
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
	}

}