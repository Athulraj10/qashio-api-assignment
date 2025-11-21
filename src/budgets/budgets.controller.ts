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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('budgets')
@Controller('budgets')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(
    @Body() createBudgetDto: CreateBudgetDto,
    @GetUser() user: { userId: string; email: string },
  ) {
    return this.budgetsService.create(createBudgetDto, user.userId);
  }

  @Get()
  findAll(
    @Query('withSpending') withSpending?: string,
    @GetUser() user?: { userId: string; email: string },
  ) {
    if (withSpending === 'true') {
      return this.budgetsService.findAllWithSpending(user?.userId);
    }
    return this.budgetsService.findAll(user?.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('withSpending') withSpending?: string,
    @GetUser() user?: { userId: string; email: string },
  ) {
    if (withSpending === 'true') {
      return this.budgetsService.findOneWithSpending(id, user?.userId);
    }
    return this.budgetsService.findOne(id, user?.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @GetUser() user?: { userId: string; email: string },
  ) {
    return this.budgetsService.update(id, updateBudgetDto, user?.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user?: { userId: string; email: string },
  ) {
    this.budgetsService.remove(id, user?.userId);
    return { message: 'Budget deleted successfully' };
  }
}



