import { CacheInterceptor, Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';

@UseInterceptors(CacheInterceptor)
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }
    @Get('/api')
    home() {
        return 'Welcome to Erics poggers API';
    }

    @Get('/api/talents/:class/:spec')
    getTalentTree(@Param('class') clazz: string, @Param('spec') spec: string) {
        return this.appService.getTalentTree(clazz, spec);
    }
}
