import { useEffect, useState } from "react";
import { useAIConfigStore } from "@/lib/store/aiConfig-store";
import { AIFeature, AIOperation, AIProvider } from "@/services/aiConfigService";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2, MessageSquare, BookOpen, Save, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/shared/components/ui/page-header";
import { PageLoader } from "@/shared/components/ui/page-loader";

const FEATURE_CONFIG: Record<
  AIFeature,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    operations: {
      operation: AIOperation;
      label: string;
      description: string;
    }[];
  }
> = {
  word: {
    label: "Palabras",
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-blue-600",
    operations: [
      { operation: "generate", label: "Generar Palabra", description: "Generación completa de palabra" },
      { operation: "examples", label: "Ejemplos", description: "Generar ejemplos de uso" },
      { operation: "codeSwitching", label: "Code Switching", description: "Ejemplos de cambio de código" },
      { operation: "types", label: "Tipos", description: "Clasificación gramatical" },
      { operation: "synonyms", label: "Sinónimos", description: "Generar sinónimos" },
      { operation: "chat", label: "Chat", description: "Conversación sobre la palabra" },
      { operation: "image", label: "Imagen", description: "Generar imagen" },
    ],
  },
  expression: {
    label: "Expresiones",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "text-purple-600",
    operations: [
      { operation: "generate", label: "Generar Expresión", description: "Generación completa de expresión" },
      { operation: "chat", label: "Chat", description: "Conversación sobre la expresión" },
      { operation: "image", label: "Imagen", description: "Generar imagen" },
    ],
  },
  exam: {
    label: "Exámenes",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "text-amber-600",
    operations: [
      { operation: "generate", label: "Generar examen", description: "Creación del examen en JSON" },
      { operation: "validate", label: "Validar examen", description: "Revisión tipo profesor" },
      { operation: "correct", label: "Corregir examen", description: "Aplicar correcciones según validación" },
      { operation: "questionChat", label: "Chat en pregunta", description: "Ayuda cuando fallas una pregunta" },
      { operation: "questionFeedback", label: "Feedback por pregunta", description: "Retroalimentación breve" },
      { operation: "evaluateTranslation", label: "Evaluar traducción", description: "Puntuación respuestas tipo traducción" },
    ],
  },
};

const PROVIDER_CONFIG: Record<
  AIProvider,
  {
    label: string;
    color: string;
    borderColor: string;
  }
> = {
  openai: {
    label: "OpenAI",
    color: "text-green-500 dark:text-green-400",
    borderColor: "border-green-500 dark:border-green-400",
  },
  deepseek: {
    label: "DeepSeek",
    color: "text-orange-500 dark:text-orange-400",
    borderColor: "border-orange-500 dark:border-orange-400",
  },
};

export default function AIConfigPage() {
  const { defaults, loading, loadConfigs, getConfig, updateConfig } =
    useAIConfigStore();
  const [activeFeature, setActiveFeature] = useState<AIFeature>("word");
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, { feature: AIFeature; operation: AIOperation; provider: AIProvider }>
  >({});

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleProviderChange = (
    feature: AIFeature,
    operation: AIOperation,
    provider: AIProvider
  ) => {
    const key = `${feature}-${operation}`;
    setPendingChanges((prev) => ({
      ...prev,
      [key]: { feature, operation, provider },
    }));
  };

  const handleSave = async (feature: AIFeature, operation: AIOperation) => {
    const key = `${feature}-${operation}`;
    const change = pendingChanges[key];
    if (!change) return;

    await updateConfig(change.feature, change.operation, change.provider);
    setPendingChanges((prev) => {
      const newChanges = { ...prev };
      delete newChanges[key];
      return newChanges;
    });
  };

  const hasPendingChange = (feature: AIFeature, operation: AIOperation) => {
    const key = `${feature}-${operation}`;
    return !!pendingChanges[key];
  };

  const getCurrentProvider = (feature: AIFeature, operation: AIOperation): AIProvider => {
    const key = `${feature}-${operation}`;
    if (pendingChanges[key]) {
      return pendingChanges[key].provider;
    }
    return getConfig(feature, operation);
  };

  const currentFeature = FEATURE_CONFIG[activeFeature];

  return (
    <div className="">
      <PageHeader
        title="Configuración de AI"
      />
      <PageLoader loading={loading}>

      <Tabs value={activeFeature} onValueChange={(v) => setActiveFeature(v as AIFeature)}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent">
          {Object.entries(FEATURE_CONFIG).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center gap-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent"
            >
              <span className={config.color}>{config.icon}</span>
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(FEATURE_CONFIG).map(([featureKey, featureConfig]) => (
          <TabsContent key={featureKey} value={featureKey} className="space-y-4 mt-6">
            <div className="space-y-4">
              {featureConfig.operations.map((op) => {
                const currentProvider = getCurrentProvider(
                  featureKey as AIFeature,
                  op.operation
                );
                const defaultProvider = defaults[featureKey as AIFeature]?.[op.operation] || "openai";
                const hasChange = hasPendingChange(featureKey as AIFeature, op.operation);
                const providerConfig = PROVIDER_CONFIG[currentProvider];

                return (
                  <div
                    key={op.operation}
                    className={`relative p-5 rounded-lg border-2 transition-all duration-200 ${
                      hasChange
                        ? `${providerConfig.borderColor} border-2 shadow-md`
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{op.label}</h3>
                          <Badge
                            variant="outline"
                            className={`${providerConfig.color} ${providerConfig.borderColor}`}
                          >
                            {providerConfig.label}
                          </Badge>
                          {currentProvider === defaultProvider && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{op.description}</p>

                        <div className="flex items-center gap-3">
                          <Select
                            value={currentProvider}
                            onValueChange={(value) =>
                              handleProviderChange(
                                featureKey as AIFeature,
                                op.operation,
                                value as AIProvider
                              )
                            }
                            disabled={op.operation === "image"}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PROVIDER_CONFIG).map(([key, config]) => {
                                // Las imágenes solo pueden usar OpenAI
                                if (op.operation === "image" && key === "deepseek") {
                                  return null;
                                }
                                return (
                                  <SelectItem key={key} value={key}>
                                    <span className={config.color}>{config.label}</span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {op.operation === "image" && (
                            <span className="text-xs text-muted-foreground">
                              Solo OpenAI (DALL-E)
                            </span>
                          )}

                          {hasChange && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleSave(featureKey as AIFeature, op.operation)
                              }
                              className="border-primary text-primary hover:bg-transparent"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Guardar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      </PageLoader>
    </div>
  );
}
