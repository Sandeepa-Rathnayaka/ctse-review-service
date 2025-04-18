import express from "express";
import { validateUserRoleAndToken } from "../middleware/auth.middleware";
import validate from "../middleware/schemavalidator.middleware";
import {
  addReviewSchema,
  updateReviewSchema,
  getReviewSchema,
  getProductReviewsSchema,
  getSellerReviewsSchema,
  markReviewAsHelpfulSchema,
} from "../schema/review.schema";
import {
  addReview,
  getReviewById,
  getProductReviews,
  getSellerReviews,
  updateReview,
  deleteReview,
  markReviewAsHelpful,
  getUserReviews,
} from "../controllers/review.controller";

const router = express.Router();

// Public routes
router.get(
  "/product/:productId",
  validate(getProductReviewsSchema),
  getProductReviews
);

router.get(
  "/seller/:sellerId",
  validate(getSellerReviewsSchema),
  getSellerReviews
);

router.get("/:id", validate(getReviewSchema), getReviewById);

router.post(
  "/helpful/:id",
  validate(markReviewAsHelpfulSchema),
  markReviewAsHelpful
);

// Authenticated routes
router.post(
  "/",
  validateUserRoleAndToken(),
  validate(addReviewSchema),
  addReview
);

router.patch(
  "/:id",
  validateUserRoleAndToken(),
  validate(updateReviewSchema),
  updateReview
);

router.delete(
  "/:id",
  validateUserRoleAndToken(),
  validate(getReviewSchema),
  deleteReview
);

router.get("/user/my-reviews", validateUserRoleAndToken(), getUserReviews);

export default router;
