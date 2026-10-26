import { BeneficiaryService } from '../services/beneficiaryService.js';
import { AiAssistantService } from '../services/aiAssistantService.js';
import { createBeneficiarySchema, updateBeneficiarySchema, searchDuplicateSchema } from '../schemas/beneficiarySchema.js';

const beneficiaryService = new BeneficiaryService();

export class BeneficiaryController {
  static async getAll(req, res, next) {
    try {
      const { search, municipio, tipo_poblacion, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await beneficiaryService.getAllBeneficiaries({
        search,
        municipio,
        tipo_poblacion,
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

  static async getById(req, res, next) {
    try {
      const beneficiary = await beneficiaryService.getBeneficiaryById(req.params.id);
      return res.json({ success: true, data: beneficiary });
    } catch (error) {
      next(error);
    }
  }

  static async getConsolidatedFile(req, res, next) {
    try {
      const file = await beneficiaryService.getConsolidatedFile(req.params.id);
      return res.json({ success: true, data: file });
    } catch (error) {
      next(error);
    }
  }

  static async checkDuplicates(req, res, next) {
    try {
      const parsed = searchDuplicateSchema.parse(req.query);
      const result = await beneficiaryService.checkDuplicates(parsed);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validatedData = createBeneficiarySchema.parse(req.body);
      const result = await beneficiaryService.registerBeneficiary(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Beneficiario registrado exitosamente con código único inmutable',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const validatedData = updateBeneficiarySchema.parse(req.body);
      const updated = await beneficiaryService.updateBeneficiary(req.params.id, validatedData);
      return res.json({
        success: true,
        message: 'Datos del beneficiario actualizados correctamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAiSummary(req, res, next) {
    try {
      const file = await beneficiaryService.getConsolidatedFile(req.params.id);
      const summary = AiAssistantService.generateCaseSummary(file);
      return res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
