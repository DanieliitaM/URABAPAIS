import { FamilyRepository } from '../repositories/familyRepository.js';
import { createFamilyMemberSchema } from '../schemas/familySchema.js';

const familyRepo = new FamilyRepository();

export class FamilyController {
  static async getByBeneficiary(req, res, next) {
    try {
      const members = await familyRepo.findByBeneficiaryId(req.params.beneficiaryId);
      return res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createFamilyMemberSchema.parse(req.body);
      const created = await familyRepo.create(validated);
      return res.status(201).json({
        success: true,
        message: 'Integrante familiar registrado exitosamente',
        data: created
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const success = await familyRepo.delete(req.params.id);
      return res.json({ success, message: success ? 'Integrante eliminado' : 'No encontrado' });
    } catch (error) {
      next(error);
    }
  }
}
