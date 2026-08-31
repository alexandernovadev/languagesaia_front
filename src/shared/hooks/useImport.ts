import { useState, useCallback } from "react";
import { toast } from "sonner";
import { axiosClient as api } from "@/services/api/HttpClient";

export type ImportType = "words" | "expressions" | "exams";
export type DuplicateStrategy = "skip" | "overwrite" | "merge" | "error";

export interface ValidationResult {
  total: number;
  valid: number;
  invalid: number;
  validationResults?: Array<{
    index: number;
    status: "valid" | "invalid";
    data?: any;
    validationResult?: {
      isValid: boolean;
      errors?: string[];
      warnings?: string[];
    };
    errors?: string[]; // Fallback for backward compatibility
  }>;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails?: Array<{
    index: number;
    error: string;
  }>;
}

export function useImport(type: ImportType) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>("skip");
  const [batchSize, setBatchSize] = useState(10);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const getEndpoint = () => {
    const endpoints = {
      words: "/api/words/import-file",
      expressions: "/api/expressions/import-file",
      exams: "/api/exams/import-file",
    };
    return endpoints[type];
  };

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationResult(null);
    setImportResult(null);
  }, []);

  const handleValidate = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const endpoint = getEndpoint();
      const response = await api.post(
        `${endpoint}?validateOnly=true&duplicateStrategy=${duplicateStrategy}&batchSize=${batchSize}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setValidationResult({
          total: data.totalWords || data.totalExpressions || data.totalExams || 0,
          valid: data.valid || 0,
          invalid: data.invalid || 0,
          validationResults: data.validationResults || [],
        });

        if (data.invalid === 0) {
          toast.success("✅ Validación exitosa: todos los registros son válidos");
        } else {
          toast.warning(`⚠️ ${data.invalid} registros inválidos encontrados`);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al validar el archivo";
      toast.error(errorMsg);
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  }, [selectedFile, duplicateStrategy, batchSize, type]);

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    if (validationResult && validationResult.invalid > 0) {
      toast.error("No se puede importar: hay registros inválidos. Por favor corrígelos primero.");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const endpoint = getEndpoint();
      const response = await api.post(
        `${endpoint}?validateOnly=false&duplicateStrategy=${duplicateStrategy}&batchSize=${batchSize}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        
        setImportResult({
          imported: data.imported || data.created || 0,
          updated: data.updated || 0,
          skipped: data.skipped || 0,
          errors: data.failed || data.errors || 0,
          errorDetails: data.errorDetails || [],
        });

        toast.success(`✅ Importación completada: ${data.imported || data.created || 0} registros importados`);
        
        // Clear file after successful import
        setTimeout(() => {
          clearFile();
        }, 3000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al importar el archivo";
      toast.error(errorMsg);
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  }, [selectedFile, duplicateStrategy, batchSize, type, validationResult, clearFile]);

  return {
    selectedFile,
    setSelectedFile,
    duplicateStrategy,
    setDuplicateStrategy,
    batchSize,
    setBatchSize,
    isValidating,
    isImporting,
    validationResult,
    importResult,
    handleValidate,
    handleImport,
    clearFile,
  };
}
