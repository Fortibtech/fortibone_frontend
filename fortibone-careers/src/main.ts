import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableCors({
        origin: '*', // Allow all for dev, or specify http://localhost:3000
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    const port = process.env.PORT || 8081;
    await app.listen(port);
    console.log(`Backend running on port ${port}`);
}
bootstrap();
