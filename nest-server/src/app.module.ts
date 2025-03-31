import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { FolderUploadModule } from './folder-upload/folder-upload.module';

@Module({
  imports: [UploadModule, FolderUploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 