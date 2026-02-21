import { Router } from "express";
import AnalyticsController from "../controllers/analytics.controller";

const analyticsController = new AnalyticsController();

const router = Router();

router.get("/top-merchant", analyticsController.getTopMerchant);
router.get("/monthly-active-merchants", analyticsController.getMonthlyActiveMerchants)
router.get("/product-adoption", analyticsController.getProductAdoption)
router.get("/kyc-funnel", analyticsController.getKycFunnel)
router.get("/failure-rates", analyticsController.getFailureRates)

export default router;