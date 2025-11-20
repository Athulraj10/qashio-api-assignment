import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('budgets')
@Controller('budgets')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  findAll(@Query('withSpending') withSpending?: string) {
    if (withSpending === 'true') {
      return this.budgetsService.findAllWithSpending();
    }
    return this.budgetsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('withSpending') withSpending?: string,
  ) {
    if (withSpending === 'true') {
      return this.budgetsService.findOneWithSpending(id);
    }
    return this.budgetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.budgetsService.remove(id);
    return { message: 'Budget deleted successfully' };
  }
}



