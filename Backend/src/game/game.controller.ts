import { Body, Controller, Get, Param, ParseIntPipe, Post} from '@nestjs/common';
import {GameInfoDto } from './dto/GameInfor.dto';
import { GameService } from './game.service';
@Controller('game')
export class GameController {

	constructor(private gameService : GameService) {}
	
	@Post('newgame')
	newGame(@Body() dto: GameInfoDto){
		console.log(dto);
        return this.gameService.newgame(dto);
    }

	@Get(':uid/GameHistory')
	getGameHistory(@Param('uid', ParseIntPipe) uid: number){
        return this.gameService.getGameHistory(uid);
    }

	@Get(":gid/info")
	getGameInfo(@Param('gid', ParseIntPipe) gid: number){
        return this.gameService.getGameInfo(gid);
    }
}
