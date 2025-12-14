import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // 필요하면 CORS 열기
app.enableCors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('K-POP Stage API')
    .setDescription('아이돌 무대 추천 서비스 API 문서')
    .setVersion('1.0.0')
    .addBearerAuth() // Firebase Auth 토큰 테스트용
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 토큰 입력 유지
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
