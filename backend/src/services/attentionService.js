import { AttentionRepository } from '../repositories/attentionRepository.js';
import { BeneficiaryRepository } from '../repositories/beneficiaryRepository.js';

export class AttentionService {
  constructor() {
    this.attentionRepo = new AttentionRepository();
    this.beneficiaryRepo = new BeneficiaryRepository();
  }

  async getAllAttentions(filters) {
    return await this.attentionRepo.findAll(filters);
  }

  async getAttentionsByBeneficiary(beneficiaryId) {
    return await this.attentionRepo.findByBeneficiaryId(beneficiaryId);
  }

  async registerAttention(data) {
    const beneficiary = await this.beneficiaryRepo.findById(data.beneficiario_id);
    if (!beneficiary) {
      const err = new Error('Beneficiario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return await this.attentionRepo.create(data);
  }
}
