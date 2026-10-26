import { CatalogService } from '../services/catalogService.js';

export class CatalogController {
  static getCatalogs(req, res, next) {
    try {
      const catalogs = CatalogService.getCatalogs();
      return res.json({
        success: true,
        data: catalogs
      });
    } catch (error) {
      next(error);
    }
  }
}
