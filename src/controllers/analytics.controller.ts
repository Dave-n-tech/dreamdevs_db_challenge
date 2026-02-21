import { Request, Response } from "express";
import * as AnalyticsService from "../services/analytics.service";

export default class AnalyticsController {
  async getTopMerchant(req: Request, res: Response) {
    try {
      const topMerchant = await AnalyticsService.getTopMerchant();
      res.json(topMerchant);
    } catch (error) {
      console.error("Error in getTopMerchant:", error);
      res.status(500).json({ error: "Failed to retrieve top merchant data" });
    }
  }

  async getMonthlyActiveMerchants(req: Request, res: Response) {
    try {
      const monthlyActiveMerchants =
        await AnalyticsService.getMonthlyActiveMerchants();
      res.status(200).json(monthlyActiveMerchants);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve monthly active merchants data" });
    }
  }

  async getProductAdoption(req: Request, res: Response) {
    try {
      const productAdoption = await AnalyticsService.getProductAdoption();
      res.status(200).json(productAdoption);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve product adoption data" });
    }
  }

  async getKycFunnel(req: Request, res: Response) {
    try {
      const kycFunnel = await AnalyticsService.getKycFunnel();
      res.status(200).json(kycFunnel);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve KYC funnel data" });
    }
  }

  async getFailureRates(req: Request, res: Response) {
    try {
      const failureRates = await AnalyticsService.getFailureRates();
      res.status(200).json(failureRates);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve failure rates data" });
    }
  }
}
