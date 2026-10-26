import { ReportService } from '../services/reportService.js';

const reportService = new ReportService();

export class ReportController {
  static async getDashboard(req, res, next) {
    try {
      const data = await reportService.getDashboardData();
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getExport(req, res, next) {
    try {
      const exportData = await reportService.getExportableSummary();
      return res.json({ success: true, data: exportData });
    } catch (error) {
      next(error);
    }
  }
}
