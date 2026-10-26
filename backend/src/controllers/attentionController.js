import { AttentionService } from '../services/attentionService.js';
import { createAttentionSchema } from '../schemas/attentionSchema.js';

const attentionService = new AttentionService();

export class AttentionController {
  static async getAll(req, res, next) {
    try {
      const { resultado_asociado, organizacion, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await attentionService.getAllAttentions({
        resultado_asociado,
        organizacion,
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
      const list = await attentionService.getAttentionsByBeneficiary(req.params.beneficiaryId);
      return res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createAttentionSchema.parse(req.body);
      const created = await attentionService.registerAttention(validated);
      return res.status(201).json({
        success: true,
        message: 'Atención o ayuda registrada exitosamente en el historial del beneficiario',
        data: created
      });
    } catch (error) {
      next(error);
    }
  }
}
