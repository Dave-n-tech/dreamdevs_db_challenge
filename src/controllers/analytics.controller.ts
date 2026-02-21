import { Response } from "express";
import * as AnalyticsService from "../services/analytics.service";

export default class AnalyticsController {
  async getTopMerchant(res: Response) {
    try {
      const topMerchant = await AnalyticsService.getTopMerchant();
      res.status(200).json(topMerchant);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve top merchant data" });
    }
  }

  async getMonthlyActiveMerchants(res: Response) {
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

  async getProductAdoption(res: Response) {
    try {
      const productAdoption = await AnalyticsService.getProductAdoption();
      res.status(200).json(productAdoption);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve product adoption data" });
    }
  }

  async getKycFunnel(res: Response) {
    try {
      const kycFunnel = await AnalyticsService.getKycFunnel();
      res.status(200).json(kycFunnel);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve KYC funnel data" });
    }
  }

  async getFailureRates(res: Response) {
    try {
      const failureRates = await AnalyticsService.getFailureRates();
      res.status(200).json(failureRates);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve failure rates data" });
    }
  }
}
