import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import {
  CreateBookingDto,
  UpdateBookingDto,
  SearchBookingDto,
  PaginatedBookingResponseDto,
  ApproveBookingDto,
} from './dto';
import { Project, ProjectStatus } from '../project/project.entity';
import { User } from '../user/user.entity';
import { Term } from '../term/term.entity';
import { RequestUser } from '../interfaces';
import { UserRole } from '../constants/user.constant';
import { getProjectStatusLabel } from 'src/project/project.utils';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
  ) {}

  /**
   * Tạo booking mới với validation thời gian trong khoảng term
   */
  async create(
    createBookingDto: CreateBookingDto,
    user: RequestUser,
  ): Promise<Booking> {
    // Kiểm tra project có tồn tại không
    const project = await this.projectRepository.findOne({
      where: {
        id: createBookingDto.projectId,
      },
      relations: ['term'],
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy đề tài');
    }

    if (
      ![
        ProjectStatus.APPROVED_BY_LECTURER,
        ProjectStatus.APPROVED_BY_FACULTY_DEAN,
        ProjectStatus.APPROVED_BY_RECTOR,
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.COMPLETED,
      ].includes(project.status)
    ) {
      const label = getProjectStatusLabel(project.status);
      throw new BadRequestException(
        `Không thể gửi yêu cầu đặt lịch bảo vệ cho đề tài, vì đề tài đang ở trạng thái ${label}`,
      );
    }

    // Kiểm tra student có tồn tại không
    const student = await this.userRepository.findOne({
      where: { id: createBookingDto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }

    // Kiểm tra student có phải là member trong đề tài không
    const isProjectMember = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.members', 'member')
      .where('project.id = :projectId', { projectId: createBookingDto.projectId })
      .andWhere('member.studentId = :studentId', { studentId: createBookingDto.studentId })
      .getOne();

    if (!isProjectMember) {
      throw new BadRequestException('Sinh viên không phải là thành viên tham gia vào đề tài này');
    }

    // Kiểm tra thời gian booking có nằm trong khoảng thời gian của term không
    const bookingTime = new Date(createBookingDto.time);
    const termStartDate = new Date(`${project.term.startDate}T00:00:00`);
    const termEndDate = new Date(`${project.term.endDate}T23:59:59`);

    if (bookingTime < termStartDate || bookingTime > termEndDate) {
      throw new BadRequestException(
        'Thời gian đặt lịch phải nằm trong khoảng thời gian của sự kiện',
      );
    }

    // Kiểm tra xem đã có booking nào cho project này vào thời gian này chưa
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        projectId: createBookingDto.projectId,
        time: bookingTime,
        status: BookingStatus.PENDING,
      },
    });

    if (existingBooking) {
      throw new ConflictException(
        'Đã có yêu cầu lịch bảo vệ đề tài này vào thời gian này',
      );
    }

    // Tạo booking mới
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      time: bookingTime,
    });

    return this.bookingRepository.save(booking);
  }

  /**
   * Lấy danh sách booking với phân trang và tìm kiếm
   */
  async findAllWithSearch(
    searchDto: SearchBookingDto,
    user: RequestUser,
  ): Promise<Booking[] | PaginatedBookingResponseDto> {
    const {
      projectId,
      studentId,
      status,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = searchDto;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.project', 'project')
      .leftJoinAndSelect('project.term', 'term')
      .leftJoinAndSelect('booking.student', 'student')
      .leftJoinAndSelect('booking.approvedByLecturer', 'approvedByLecturer')
      .leftJoinAndSelect(
        'booking.approvedByFacultyDean',
        'approvedByFacultyDean',
      )
      .leftJoinAndSelect('booking.approvedByRector', 'approvedByRector');

    // Apply search filters
    if (projectId) {
      queryBuilder.andWhere('booking.projectId = :projectId', { projectId });
    }

    if (studentId) {
      queryBuilder.andWhere('booking.studentId = :studentId', { studentId });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('booking.time BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    // Apply user role-based filtering
    if (user) {
      const roles = user.roles || [];

      // Admin: No additional filtering needed
      if (!roles.includes(UserRole.Admin) && !roles.includes(UserRole.Rector)) {
        // Student: Return bookings created by user
        if (roles.includes(UserRole.Student)) {
          queryBuilder.andWhere('booking.studentId = :userId', {
            userId: user.id,
          });
        }

        // Lecturer: Return bookings for projects where user is supervisor
        if (roles.includes(UserRole.Lecturer)) {
          queryBuilder.andWhere('project.supervisorId = :userId', {
            userId: user.id,
          });
        }

        // DepartmentHead: Return bookings for projects in user's department
        if (roles.includes(UserRole.DepartmentHead)) {
          if (user?.departmentId) {
            queryBuilder.andWhere('project.departmentId = :departmentId', {
              departmentId: user.departmentId,
            });
          }
        }

        // FacultyDean: Return bookings for projects in user's faculty
        if (roles.includes(UserRole.FacultyDean)) {
          if (user?.facultyId) {
            queryBuilder.andWhere('project.facultyId = :facultyId', {
              facultyId: user.facultyId,
            });
          }
        }
      }
    }

    // Apply sorting
    if (sortBy) {
      const allowedSortFields = [
        'id',
        'time',
        'projectId',
        'studentId',
        'status',
        'createdAt',
        'updatedAt',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const order = sortOrder || 'DESC';
      queryBuilder.orderBy(`booking.${sortField}`, order);
    } else {
      queryBuilder.orderBy('booking.createdAt', 'DESC');
    }

    // Apply pagination
    if (page && limit) {
      const total = await queryBuilder.getCount();

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const data = await queryBuilder.getMany();

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      };
    }

    return queryBuilder.getMany();
  }

  /**
   * Lấy tất cả booking dựa trên role của user
   */
  async findAll(user?: RequestUser): Promise<Booking[]> {
    if (!user) {
      return this.bookingRepository.find({
        relations: [
          'project',
          'project.term',
          'student',
          'approvedByLecturer',
          'approvedByFacultyDean',
          'approvedByRector',
        ],
      });
    }

    const roles = user.roles || [];

    // Admin: Return all bookings
    if (roles.includes(UserRole.Admin)) {
      return this.bookingRepository.find({
        relations: [
          'project',
          'project.term',
          'student',
          'approvedByLecturer',
          'approvedByFacultyDean',
          'approvedByRector',
        ],
      });
    }

    // Student: Return bookings created by user
    if (roles.includes(UserRole.Student)) {
      return this.bookingRepository.find({
        where: { studentId: user.id },
        relations: [
          'project',
          'project.term',
          'student',
          'approvedByLecturer',
          'approvedByFacultyDean',
          'approvedByRector',
        ],
      });
    }

    // Lecturer: Return bookings for projects where user is supervisor
    if (roles.includes(UserRole.Lecturer)) {
      return this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.project', 'project')
        .leftJoinAndSelect('project.term', 'term')
        .leftJoinAndSelect('booking.student', 'student')
        .leftJoinAndSelect('booking.approvedByLecturer', 'approvedByLecturer')
        .leftJoinAndSelect(
          'booking.approvedByFacultyDean',
          'approvedByFacultyDean',
        )
        .leftJoinAndSelect('booking.approvedByRector', 'approvedByRector')
        .where('project.supervisorId = :userId', { userId: user.id })
        .getMany();
    }

    // DepartmentHead: Return bookings for projects in user's department
    if (roles.includes(UserRole.DepartmentHead)) {
      if (user?.departmentId) {
        return this.bookingRepository
          .createQueryBuilder('booking')
          .leftJoinAndSelect('booking.project', 'project')
          .leftJoinAndSelect('project.term', 'term')
          .leftJoinAndSelect('booking.student', 'student')
          .leftJoinAndSelect('booking.approvedByLecturer', 'approvedByLecturer')
          .leftJoinAndSelect(
            'booking.approvedByFacultyDean',
            'approvedByFacultyDean',
          )
          .leftJoinAndSelect('booking.approvedByRector', 'approvedByRector')
          .where('project.departmentId = :departmentId', {
            departmentId: user.departmentId,
          })
          .getMany();
      }
    }

    // FacultyDean: Return bookings for projects in user's faculty
    if (roles.includes(UserRole.FacultyDean)) {
      if (user?.facultyId) {
        return this.bookingRepository
          .createQueryBuilder('booking')
          .leftJoinAndSelect('booking.project', 'project')
          .leftJoinAndSelect('project.term', 'term')
          .leftJoinAndSelect('booking.student', 'student')
          .leftJoinAndSelect('booking.approvedByLecturer', 'approvedByLecturer')
          .leftJoinAndSelect(
            'booking.approvedByFacultyDean',
            'approvedByFacultyDean',
          )
          .leftJoinAndSelect('booking.approvedByRector', 'approvedByRector')
          .where('project.facultyId = :facultyId', {
            facultyId: user.facultyId,
          })
          .getMany();
      }
    }

    return [];
  }

  /**
   * Lấy booking theo ID
   */
  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'project',
        'project.term',
        'student',
        'approvedByLecturer',
        'approvedByFacultyDean',
        'approvedByRector',
      ],
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch bảo vệ đề tài có ID ${id}`);
    }

    return booking;
  }

  /**
   * Cập nhật booking
   */
  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch bảo vệ đề tài có ID ${id}`);
    }

    // Nếu cập nhật thời gian, kiểm tra lại validation
    if (updateBookingDto.time) {
      const project = await this.projectRepository.findOne({
        where: { id: booking.projectId },
        relations: ['term'],
      });

      if (project) {
        const bookingTime = new Date(updateBookingDto.time);
        const termStartDate = new Date(`${project.term.startDate}T00:00:00`);
        const termEndDate = new Date(`${project.term.endDate}T23:59:59`);

        if (bookingTime < termStartDate || bookingTime > termEndDate) {
          throw new BadRequestException(
            'Thời gian đặt lịch phải nằm trong khoảng thời gian của sự kiện',
          );
        }
      }
    }

    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  /**
   * Xóa booking (soft delete)
   */
  async remove(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch bảo vệ đề tài có ID ${id}`);
    }

    await this.bookingRepository.softDelete(id);
    return booking;
  }

  /**
   * Duyệt booking bởi giảng viên
   */
  async approveByLecturer(
    id: number,
    approveDto: ApproveBookingDto,
    user: RequestUser,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['project', 'project.term'],
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch bảo vệ đề tài có ID ${id}`);
    }

    // Kiểm tra user có phải là giảng viên hướng dẫn của project không
    if (booking.project.supervisorId !== user.id) {
      throw new BadRequestException('Bạn không có quyền duyệt lịch bảo vệ đề tài này');
    }

    // Kiểm tra trạng thái hiện tại
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Lịch bảo vệ đề tài này đã được xử lý');
    }

    booking.status = approveDto.status;
    booking.approvedByLecturerId = user.id;

    return this.bookingRepository.save(booking);
  }

  /**
   * Duyệt booking bởi trưởng khoa
   */
  async approveByFacultyDean(
    id: number,
    approveDto: ApproveBookingDto,
    user: RequestUser,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['project', 'project.term'],
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch bảo vệ đề tài có ID ${id}`);
    }

    // Kiểm tra user có phải là trưởng khoa của project không
    if (booking.project.facultyId !== user.facultyId) {
      throw new BadRequestException('Bạn không có quyền duyệt lịch bảo vệ đề tài này');
    }

    // Kiểm tra trạng thái hiện tại
    if (booking.status !== BookingStatus.APPROVED_BY_LECTURER) {
      throw new BadRequestException('Lịch bảo vệ đề tài phải được giảng viên duyệt trước');
    }

    booking.status = approveDto.status;
    booking.approvedByFacultyDeanId = user.id;

    return this.bookingRepository.save(booking);
  }

  /**
   * Duyệt booking bởi hiệu trưởng
   */
  async approveByRector(
    id: number,
    approveDto: ApproveBookingDto,
    user: RequestUser,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['project', 'project.term'],
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch bảo vệ đề tài có ID ${id}`);
    }

    // Kiểm tra trạng thái hiện tại
    if (booking.status !== BookingStatus.APPROVED_BY_FACULTY_DEAN) {
      throw new BadRequestException(
        'Lịch bảo vệ đề tài phải được trưởng khoa duyệt trước',
      );
    }

    booking.status = approveDto.status;
    booking.approvedByRectorId = user.id;

    return this.bookingRepository.save(booking);
  }
}
