import { FollowupService } from '../services/followupService.js';
import { createFollowupSchema, updateFollowupSchema } from '../schemas/followupSchema.js';

const followupService = new FollowupService();

export class FollowupController {
  static async getAll(req, res, next) {
    try {
      const { estado_caso, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await followupService.getAllFollowups({
        estado_caso,
        limit: Number(limit),
        offset
      });

      return res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(result.total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByBeneficiary(req, res, next) {
    try {
      const list = await followupService.getFollowupsByBeneficiary(req.params.beneficiaryId);
      return res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createFollowupSchema.parse(req.body);
      const created = await followupService.registerFollowup(validated);
      return res.status(201).json({
        success: true,
        message: 'Seguimiento registrado exitosamente con acción pendiente establecida',
        data: created
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const validated = updateFollowupSchema.parse(req.body);
      const updated = await followupService.updateFollowup(req.params.id, validated);
      return res.json({
        success: true,
        message: 'Seguimiento actualizado correctamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
