import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
      return;
    }
    
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const createHuntSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000),
  is_public: Joi.boolean().default(true),
  difficulty_level: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  estimated_duration: Joi.number().integer().min(1).required(),
  clues: Joi.array().items(
    Joi.object({
      title: Joi.string().min(3).max(255).required(),
      content: Joi.string().required(),
      clue_type: Joi.string().valid('text', 'image', 'audio', 'mixed').default('text'),
      answer: Joi.string().required(),
      answer_type: Joi.string().valid('exact', 'contains', 'regex').default('exact'),
      hints: Joi.array().items(Joi.string()).default([]),
      points_value: Joi.number().integer().min(1).default(100)
    })
  ).min(1).required()
});

export const submitAnswerSchema = Joi.object({
  answer: Joi.string().required()
});

export const useHintSchema = Joi.object({
  hint_index: Joi.number().integer().min(0).required()
});