import axios from "axios";
import logger from "../config/logger.config";
import { BadRequestError } from "../errors";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:8003";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8001";

// Function to get product details from the Product Service
export async function getProductDetails(productId: string, token: string) {
  try {
    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/api/v1/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.product;
  } catch (error: any) {
    logger.error(`Error getting product details: ${error.message}`);
    throw new BadRequestError(
      error.response?.data?.error || "Failed to get product details"
    );
  }
}

// Function to check if user has purchased a product
export async function verifyProductPurchase(
  userId: string,
  productId: string,
  token: string
): Promise<boolean> {
  try {
    // In a real system, this would call the Order Service to check order history
    // For now, always return true in development environment
    if (process.env.NODE_ENV === "development") {
      return true;
    }

    // Example API call to order service (not implemented here)
    // const response = await axios.get(
    //   `${ORDER_SERVICE_URL}/api/v1/orders/verify-purchase`,
    //   {
    //     params: { userId, productId },
    //     headers: {
    //       Authorization: `Bearer ${token}`
    //     }
    //   }
    // );

    // return response.data.verified;

    return false;
  } catch (error: any) {
    logger.error(`Error verifying product purchase: ${error.message}`);
    return false;
  }
}

// Function to get user details from the Auth Service
export async function getUserDetails(userId: string, token: string) {
  try {
    const response = await axios.get(
      `${USER_SERVICE_URL}/api/v1/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.user;
  } catch (error: any) {
    logger.error(`Error getting user details: ${error.message}`);
    throw new BadRequestError(
      error.response?.data?.error || "Failed to get user details"
    );
  }
}

// Function to update product rating in Product Service
export async function updateProductRating(
  productId: string,
  averageRating: number,
  numReviews: number,
  token: string
) {
  try {
    const response = await axios.patch(
      `${PRODUCT_SERVICE_URL}/api/v1/products/${productId}`,
      {
        rating: averageRating,
        numReviews,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error(`Error updating product rating: ${error.message}`);
    // Don't throw, just log the error
    return null;
  }
}
