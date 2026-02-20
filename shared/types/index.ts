/**
 * Barril principal de exportação de tipos compartilhados
 * Importa e re-exporta todos os tipos modularizados
 */

// Tipos de domínio (entidades principais)
export * from "./domain";

// Tipos de formulário
export * from "./forms";

// Tipos de UI
export * from "./ui";

// Tipos de hooks
export * from "./hooks";

// Manter compatibilidade com exports existentes
export * from "../schemas/athlete-schema";
export * from "../schemas/training-schema";
