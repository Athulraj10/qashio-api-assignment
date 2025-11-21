import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto, userId: string | null): Promise<Category> {

    const where: any = { name: createCategoryDto.name };
    if (userId) {
      where.userId = userId;
    }
    const existingCategory = await this.categoryRepository.findOne({
      where,
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`,
      );
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      userId,
    });
    return await this.categoryRepository.save(category);
  }

  async findAll(userId?: string | null): Promise<Category[]> {
    if (!userId) {
      return [];
    }
    const where: any = { userId };
    return await this.categoryRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId?: string | null): Promise<Category> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }
    const findOptions: any = { where };
    const category = await this.categoryRepository.findOne(findOptions);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
}

