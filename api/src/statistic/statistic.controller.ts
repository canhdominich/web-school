import { Controller, Get } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatisticResponseDto } from './dto/statistic-response.dto';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get()
  @ApiOperation({ summary: 'Get overall statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: StatisticResponseDto,
  })
  async getStatistics(): Promise<StatisticResponseDto> {
    return this.statisticService.getOverallStatistics();
  }
} 