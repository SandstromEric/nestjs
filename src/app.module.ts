import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { PuppeteerModule } from 'nest-puppeteer';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
    imports: [
        HttpModule, 
        PuppeteerModule.forRoot(),
        CacheModule.register({ttl: 60}),
        ClientsModule.register([
            {
                name: 'MATH_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379,
                }
            },
        ]),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
