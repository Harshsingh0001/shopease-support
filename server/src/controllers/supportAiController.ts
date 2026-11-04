import type { Response, NextFunction } from "express";
import { processCustomerQuery, generateAgentDraftReply } from "../modules/ai/aiService.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../utils/AppError.js";

/**
 * Customer AI Support Endpoint
 */
export const askSupport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, ticketId } = req.body as {
      message: string;
      ticketId?: string;
    };

    const result = await processCustomerQuery({
      customerId: req.user!.id,
      message,
      ticketId,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agent Copilot: Draft suggested reply for ticket
 */
export const generateDraft = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = String(req.params.id);

    if (!ticketId) {
      return next(AppError.badRequest("Ticket ID is required"));
    }

    const result = await generateAgentDraftReply(ticketId, req.user!.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
