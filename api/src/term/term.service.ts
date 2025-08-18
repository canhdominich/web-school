import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Term } from './term.entity';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';

@Injectable()
export class TermService {
  constructor(
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
  ) {}

  async create(createTermDto: CreateTermDto): Promise<Term> {
    // Check if term code already exists
    const existingTerm = await this.termRepository.findOne({
      where: { code: createTermDto.code },
    });
    if (existingTerm) {
      throw new ConflictException('Mã học kỳ đã tồn tại');
    }

    const term = this.termRepository.create(createTermDto);
    return this.termRepository.save(term);
  }

  async findAll(): Promise<Term[]> {
    return this.termRepository.find();
  }

  async findOne(id: number): Promise<Term> {
    const term = await this.termRepository.findOne({ where: { id } });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy học kỳ có ID ${id}`);
    }

    return term;
  }

  async update(id: number, updateTermDto: UpdateTermDto): Promise<Term> {
    const term = await this.termRepository.findOne({ where: { id } });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy học kỳ có ID ${id}`);
    }

    // Check if term code already exists (if code is being updated)
    if (updateTermDto.code && updateTermDto.code !== term.code) {
      const existingTerm = await this.termRepository.findOne({
        where: { code: updateTermDto.code },
      });
      if (existingTerm) {
        throw new ConflictException('Mã học kỳ đã tồn tại');
      }
    }

    Object.assign(term, updateTermDto);
    return this.termRepository.save(term);
  }

  async remove(id: number): Promise<Term> {
    const term = await this.termRepository.findOne({ where: { id } });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy học kỳ có ID ${id}`);
    }

    await this.termRepository.remove(term);
    return term;
  }
}
