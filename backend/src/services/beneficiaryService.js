import { BeneficiaryRepository } from '../repositories/beneficiaryRepository.js';
import { FamilyRepository } from '../repositories/familyRepository.js';
import { ParticipationRepository } from '../repositories/participationRepository.js';
import { AttentionRepository } from '../repositories/attentionRepository.js';

export class BeneficiaryService {
  constructor() {
    this.beneficiaryRepo = new BeneficiaryRepository();
    this.familyRepo = new FamilyRepository();
    this.participationRepo = new ParticipationRepository();
    this.attentionRepo = new AttentionRepository();
  }

  async getAllBeneficiaries(filters) {
    return await this.beneficiaryRepo.findAll(filters);
  }

  async getBeneficiaryById(id) {
    const beneficiary = await this.beneficiaryRepo.findById(id);
    if (!beneficiary) {
      const error = new Error('Beneficiario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return beneficiary;
  }

  async getConsolidatedFile(id) {
    const file = await this.beneficiaryRepo.getConsolidatedFile(id);
    if (!file) {
      const error = new Error('Ficha de beneficiario no encontrada');
      error.statusCode = 404;
      throw error;
    }
    return file;
  }

  /**
   * REGLA OBLIGATORIA DE BENEFICIARIO ÚNICO (Sección 5.1 de la Guía)
   * 1. Verifica si ya existe una persona con el mismo tipo y número de documento.
   * 2. Si no tiene documento o no hay coincidencia exacta, busca coincidencias por nombre, teléfono y edad.
   */
  async checkDuplicates({ tipo_documento, numero_documento, nombre_completo, telefono, edad }) {
    // 1. Coincidencia exacta por documento
    if (numero_documento && tipo_documento && tipo_documento !== 'Sin documento') {
      const exactMatch = await this.beneficiaryRepo.findByDocument(tipo_documento, numero_documento);
      if (exactMatch) {
        return {
          duplicateFound: true,
          matchType: 'EXACT_DOCUMENT',
          message: `Ya existe un beneficiario registrado con el documento ${tipo_documento} ${numero_documento} (${exactMatch.nombre_completo}). Abra su ficha existente.`,
          existingBeneficiary: exactMatch
        };
      }
    }

    // 2. Coincidencia similar (nombre, teléfono o edad)
    if (nombre_completo || telefono) {
      const similarRecords = await this.beneficiaryRepo.findSimilar({
        nombre_completo,
        telefono,
        edad
      });

      if (similarRecords.length > 0) {
        return {
          duplicateFound: false,
          hasSimilarWarnings: true,
          matchType: 'SIMILAR_WARNING',
          message: `Se encontraron ${similarRecords.length} persona(s) con nombres o datos de contacto similares. Verifique antes de continuar.`,
          matches: similarRecords
        };
      }
    }

    return {
      duplicateFound: false,
      hasSimilarWarnings: false,
      message: 'No se encontraron coincidencias previas. Puede proceder con el registro.'
    };
  }

  /**
   * Registro integral:
   * Crea el beneficiario único, registra familiares si vienen en la carga,
   * y opcionalmente vincula a un programa inicial con su primera atención.
   */
  async registerBeneficiary(data) {
    // 1. Validar duplicado exacto por documento
    if (data.numero_documento && data.tipo_documento && data.tipo_documento !== 'Sin documento') {
      const existing = await this.beneficiaryRepo.findByDocument(data.tipo_documento, data.numero_documento);
      if (existing) {
        const err = new Error(
          `Imposible duplicar registro: Ya existe ${existing.nombre_completo} con código ${existing.codigo_interno} y documento ${data.tipo_documento} ${data.numero_documento}.`
        );
        err.statusCode = 409;
        err.existingId = existing.id;
        throw err;
      }
    }

    // 2. Crear beneficiario
    const newBeneficiary = await this.beneficiaryRepo.create(data);

    // 3. Registrar familiares si vienen incluidos
    if (data.familiares && Array.isArray(data.familiares) && data.familiares.length > 0) {
      for (const fam of data.familiares) {
        await this.familyRepo.create({
          beneficiario_id: newBeneficiary.id,
          ...fam
        });
      }
    }

    // 4. Si se seleccionó un programa inicial, vincularlo
    if (data.programa_id) {
      await this.participationRepo.create({
        beneficiario_id: newBeneficiary.id,
        programa_id: data.programa_id,
        fecha_vinculacion: data.fecha_registro || new Date().toISOString().slice(0, 10),
        estado: 'Inscrito'
      });
    }

    // 5. Si se registró una primera atención o kit
    if (data.actividad_inicial && data.actividad_inicial.descripcion) {
      await this.attentionRepo.create({
        beneficiario_id: newBeneficiary.id,
        programa_id: data.programa_id || null,
        fecha_atencion: data.fecha_registro || new Date().toISOString().slice(0, 10),
        tipo_atencion_ayuda: data.actividad_inicial.tipo_atencion_ayuda || 'Ayuda',
        descripcion: data.actividad_inicial.descripcion,
        organizacion: data.organizacion_responsable || 'COOPI',
        responsable: data.actividad_inicial.responsable || null,
        resultado: 'Atendido'
      });
    }

    return await this.getConsolidatedFile(newBeneficiary.id);
  }

  async updateBeneficiary(id, data) {
    const existing = await this.getBeneficiaryById(id);

    // Validar si el cambio de documento colisiona con otro beneficiario distinto
    if (data.numero_documento && data.tipo_documento) {
      const match = await this.beneficiaryRepo.findByDocument(data.tipo_documento, data.numero_documento);
      if (match && match.id !== existing.id) {
        const err = new Error(`El documento ${data.tipo_documento} ${data.numero_documento} pertenece a otro beneficiario (${match.nombre_completo}).`);
        err.statusCode = 409;
        throw err;
      }
    }

    return await this.beneficiaryRepo.update(id, data);
  }
}
