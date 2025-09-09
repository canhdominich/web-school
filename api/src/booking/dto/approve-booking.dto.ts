import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '../booking.entity';

export class ApproveBookingDto {
  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.APPROVED_BY_LECTURER,
    description: 'Trạng thái mới của booking',
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}
