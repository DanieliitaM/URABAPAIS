import { FollowupRepository } from '../repositories/followupRepository.js';
import { BeneficiaryRepository } from '../repositories/beneficiaryRepository.js';

export class FollowupService {
  constructor() {
    this.followupRepo = new FollowupRepository();
    this.beneficiaryRepo = new BeneficiaryRepository();
  }

  async getAllFollowups(filters) {
    return await this.followupRepo.findAll(filters);
  }

  async getFollowupsByBeneficiary(beneficiaryId) {
    return await this.followupRepo.findByBeneficiaryId(beneficiaryId);
  }

  async registerFollowup(data) {
    const beneficiary = await this.beneficiaryRepo.findById(data.beneficiario_id);
    if (!beneficiary) {
      const err = new Error('Beneficiario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return await this.followupRepo.create(data);
  }

  async updateFollowup(id, data) {
    const updated = await this.followupRepo.update(id, data);
    if (!updated) {
      const err = new Error('Seguimiento no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }
}
