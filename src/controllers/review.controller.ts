import { Request, Response } from "express";
import * as ReviewService from "../services/review.service";
import logger from "../config/logger.config";
import { BadRequestError } from "../errors";
import {
  ReviewRating,
  ReviewType,
  IReviewFilters,
} from "../types/review.types";

// Add a new review
export const addReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    const token = req.headers.authorization?.split(" ")[1] || "";

    const result = await ReviewService.addReview(user.id, req.body, token);

    return res.status(201).json({
      message: "Review added successfully",
      review: result,
    });
  } catch (error: any) {
    logger.error(`Error adding review: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

// Get a review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1] || "";

    const review = await ReviewService.getReviewById(id, token);

    return res.status(200).json({
      review,
    });
  } catch (error: any) {
    logger.error(`Error getting review: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

// Get product reviews
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const token = req.headers.authorization?.split(" ")[1] || "";

    // Parse filters from query params
    const filters: IReviewFilters = {
      sortBy: req.query.sortBy as string,
      order: req.query.order as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      rating: req.query.rating
        ? (parseInt(req.query.rating as string) as ReviewRating)
        : undefined,
    };

    const result = await ReviewService.getProductReviews(
      productId,
      filters,
      token
    );

    return res.status(200).json({
      reviews: result.reviews,
      total: result.total,
      pages: result.pages,
      summary: result.summary,
    });
  } catch (error: any) {
    logger.error(`Error getting product reviews: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

// Get seller reviews
export const getSellerReviews = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const token = req.headers.authorization?.split(" ")[1] || "";

    // Parse filters from query params
    const filters: IReviewFilters = {
      sortBy: req.query.sortBy as string,
      order: req.query.order as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      rating: req.query.rating
        ? (parseInt(req.query.rating as string) as ReviewRating)
        : undefined,
    };

    const result = await ReviewService.getSellerReviews(
      sellerId,
      filters,
      token
    );

    return res.status(200).json({
      reviews: result.reviews,
      total: result.total,
      pages: result.pages,
      summary: result.summary,
    });
  } catch (error: any) {
    logger.error(`Error getting seller reviews: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

// Update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    const token = req.headers.authorization?.split(" ")[1] || "";

    const result = await ReviewService.updateReview(
      id,
      user.id,
      req.body,
      token
    );

    return res.status(200).json({
      message: "Review updated successfully",
      review: result,
    });
  } catch (error: any) {
    logger.error(`Error updating review: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    const token = req.headers.authorization?.split(" ")[1] || "";
    const isAdmin = user.role === "admin";

    const result = await ReviewService.deleteReview(
      id,
      user.id,
      isAdmin,
      token
    );

    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(`Error deleting review: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

// Mark a review as helpful
export const markReviewAsHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await ReviewService.markReviewAsHelpful(id);

    return res.status(200).json({
      message: "Review marked as helpful",
      helpfulVotes: result.helpfulVotes,
    });
  } catch (error: any) {
    logger.error(`Error marking review as helpful: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};

// Get user's reviews
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    const token = req.headers.authorization?.split(" ")[1] || "";

    // Parse filters from query params
    const filters: IReviewFilters = {
      sortBy: req.query.sortBy as string,
      order: req.query.order as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
    };

    const result = await ReviewService.getUserReviews(user.id, filters, token);

    return res.status(200).json({
      reviews: result.reviews,
      total: result.total,
      pages: result.pages,
    });
  } catch (error: any) {
    logger.error(`Error getting user reviews: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
};
