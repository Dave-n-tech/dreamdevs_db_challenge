import { Router } from "express";
import AnalyticsController from "../controllers/analytics.controller";

const analyticsController = new AnalyticsController();

const router = Router();

router.get("/top-merchant", (req, res) => analyticsController.getTopMerchant(req, res));
router.get("/monthly-active-merchants", (req, res) => analyticsController.getMonthlyActiveMerchants(req, res));
router.get("/product-adoption", (req, res) => analyticsController.getProductAdoption(req, res));
router.get("/kyc-funnel", (req, res) => analyticsController.getKycFunnel(req, res));
router.get("/failure-rates", (req, res) => analyticsController.getFailureRates(req, res));

export default router;