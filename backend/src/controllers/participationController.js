import { ParticipationService } from '../services/participationService.js';
import { createParticipationSchema, updateParticipationSchema } from '../schemas/participationSchema.js';

const participationService = new ParticipationService();

export class ParticipationController {
  static async getByBeneficiary(req, res, next) {
    try {
      const list = await participationService.getParticipationsByBeneficiary(req.params.beneficiaryId);
      return res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  static async enroll(req, res, next) {
    try {
      const validated = createParticipationSchema.parse(req.body);
      const created = await participationService.enrollBeneficiaryInProgram(validated);
      return res.status(201).json({
        success: true,
        message: 'Beneficiario vinculado al programa exitosamente',
        data: created
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const validated = updateParticipationSchema.parse(req.body);
      const updated = await participationService.updateParticipationStatus(
        req.params.id,
        validated.estado,
        validated.motivo_cambio
      );
      return res.json({
        success: true,
        message: `Estado actualizado a: ${validated.estado}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
