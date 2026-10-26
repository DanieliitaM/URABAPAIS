import { ProgramRepository } from '../repositories/programRepository.js';

export class ProgramService {
  constructor() {
    this.programRepo = new ProgramRepository();
  }

  async getAllPrograms() {
    return await this.programRepo.findAll();
  }

  async getProgramById(id) {
    const program = await this.programRepo.findById(id);
    if (!program) {
      const err = new Error('Programa no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return program;
  }

  async createProgram(data) {
    return await this.programRepo.create(data);
  }
}
