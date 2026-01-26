import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableCors({
        origin: true, // Allow all origins (for development/VPS IP access)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    const port = process.env.PORT || 8081;
    await app.listen(port);
    console.log(`Backend running on port ${port}`);
}
bootstrap();
