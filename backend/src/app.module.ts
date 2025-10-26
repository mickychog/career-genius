import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Carga variables de entorno
    MongooseModule.forRoot(process.env.MONGO_URI!), // Conecta a Mongo
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }