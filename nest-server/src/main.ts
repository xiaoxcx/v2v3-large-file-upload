import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置请求体解析
  app.use(json({ limit: '50mb' }));
  
  // 配置CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });
  
  // 应用全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  await app.listen(3030);
  console.log('Nest.js 大文件上传服务已启动，监听端口: 3030');
}
bootstrap(); 