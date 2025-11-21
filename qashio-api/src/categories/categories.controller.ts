import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('categories')
@Controller('categories')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: { userId: string; email: string },
  ) {
    return this.categoriesService.create(createCategoryDto, user.userId);
  }

  @Get()
  findAll(@GetUser() user?: { userId: string; email: string }) {
    return this.categoriesService.findAll(user?.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser() user?: { userId: string; email: string },
  ) {
    return this.categoriesService.findOne(id, user?.userId);
  }
}

