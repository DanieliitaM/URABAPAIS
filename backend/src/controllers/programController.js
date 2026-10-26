import { ProgramService } from '../services/programService.js';
import { createProgramSchema } from '../schemas/programSchema.js';

const programService = new ProgramService();

export class ProgramController {
  static async getAll(req, res, next) {
    try {
      const programs = await programService.getAllPrograms();
      return res.json({ success: true, data: programs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const program = await programService.getProgramById(req.params.id);
      return res.json({ success: true, data: program });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createProgramSchema.parse(req.body);
      const created = await programService.createProgram(validated);
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
}
