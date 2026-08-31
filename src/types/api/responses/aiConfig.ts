/**
 * AI Config Response Types
 */

export type AIFeature = "word" | "expression" | "exam";

export type AIOperation =
  | "generate"
  | "examples"
  | "codeSwitching"
  | "types"
  | "synonyms"
  | "chat"
  | "image"
  | "text"
  | "topic"
  | "validate"
  | "correct"
  | "questionChat"
  | "questionFeedback"
  | "evaluateTranslation";

export type AIProvider = "openai" | "deepseek";

export interface AIConfig {
  feature: AIFeature;
  operation: AIOperation;
  provider: AIProvider;
}

export interface AIConfigResponse {
  _id: string;
  feature: AIFeature;
  operation: AIOperation;
  provider: AIProvider;
  userId: string;
}

export interface AIConfigSingleResponse {
  _id: string;
  feature: AIFeature;
  operation: AIOperation;
  provider: AIProvider;
  default?: boolean;
}
