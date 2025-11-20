import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initializeDatabase } from './database/init-database';

async function bootstrap() {
  try {
    // Initialize database (create if doesn't exist) before starting the app
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
  
  // Now create the app
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  // Enable CORS for frontend integration
  app.enableCors();
  
  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Qashio Expense Tracker API')
    .setDescription('A comprehensive API for tracking income, expenses, budgets, and categories')
    .setVersion('1.0')
    .addTag('transactions', 'Transaction management endpoints')
    .addTag('categories', 'Category management endpoints')
    .addTag('budgets', 'Budget management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
