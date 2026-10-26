import { ParticipationRepository } from '../repositories/participationRepository.js';
import { BeneficiaryRepository } from '../repositories/beneficiaryRepository.js';
import { ProgramRepository } from '../repositories/programRepository.js';

export class ParticipationService {
  constructor() {
    this.participationRepo = new ParticipationRepository();
    this.beneficiaryRepo = new BeneficiaryRepository();
    this.programRepo = new ProgramRepository();
  }

  async getParticipationsByBeneficiary(beneficiaryId) {
    return await this.participationRepo.findByBeneficiaryId(beneficiaryId);
  }

  async enrollBeneficiaryInProgram(data) {
    const beneficiary = await this.beneficiaryRepo.findById(data.beneficiario_id);
    if (!beneficiary) {
      const err = new Error('Beneficiario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const program = await this.programRepo.findById(data.programa_id);
    if (!program) {
      const err = new Error('Programa no encontrado');
      err.statusCode = 404;
      throw err;
    }

    // Comprobar si ya está inscrito
    const existing = await this.participationRepo.findByBeneficiaryAndProgram(data.beneficiario_id, data.programa_id);
    if (existing && existing.estado !== 'Finalizado' && existing.estado !== 'Retirado') {
      const err = new Error(`El beneficiario ya cuenta con una vinculación activa en este programa (${existing.estado}). Puede actualizar su estado.`);
      err.statusCode = 400;
      throw err;
    }

    return await this.participationRepo.create(data);
  }

  async updateParticipationStatus(id, estado, motivo_cambio) {
    const validStates = ['Inscrito', 'En proceso', 'Finalizado', 'Retirado'];
    if (!validStates.includes(estado)) {
      const err = new Error(`Estado inválido. Debe ser uno de: ${validStates.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const updated = await this.participationRepo.updateStatus(id, estado, motivo_cambio);
    if (!updated) {
      const err = new Error('Participación no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }
}
