import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { aiConfigService, type AIConfig, type AIFeature, type AIOperation, type AIProvider } from '@/services/aiConfigService';
import { toast } from 'sonner';

interface AIConfigState {
  configs: AIConfig[];
  defaults: Record<AIFeature, Record<string, AIProvider>>;
  loading: boolean;
  loadConfigs: () => Promise<void>;
  getConfig: (feature: AIFeature, operation: AIOperation) => AIProvider;
  updateConfig: (feature: AIFeature, operation: AIOperation, provider: AIProvider) => Promise<void>;
  resetConfig: (feature: AIFeature, operation: AIOperation) => Promise<void>;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      configs: [],
      defaults: {
        word: {
          generate: 'openai',
          examples: 'openai',
          codeSwitching: 'openai',
          types: 'openai',
          synonyms: 'openai',
          chat: 'openai',
          image: 'openai',
        },
        expression: {
          generate: 'openai',
          chat: 'openai',
          image: 'openai',
        },
        exam: {
          generate: 'openai',
          validate: 'deepseek',
          correct: 'deepseek',
          questionChat: 'openai',
          questionFeedback: 'openai',
          evaluateTranslation: 'openai',
        },
      },
      loading: false,

      loadConfigs: async () => {
        set({ loading: true });
        try {
          const response = await aiConfigService.getConfigs();
          set({
            configs: response.data.configs,
            defaults: response.data.defaults,
            loading: false,
          });
        } catch (error: any) {
          console.error('Error loading AI configs:', error);
          toast.error('Error al cargar configuraciones de AI');
          set({ loading: false });
        }
      },

      getConfig: (feature: AIFeature, operation: AIOperation) => {
        const { configs, defaults } = get();
        const config = configs.find(
          (c) => c.feature === feature && c.operation === operation
        );
        return config?.provider || defaults[feature]?.[operation] || 'openai';
      },

      updateConfig: async (feature: AIFeature, operation: AIOperation, provider: AIProvider) => {
        try {
          const response = await aiConfigService.saveConfig(feature, operation, provider);
          
          // Actualizar estado local
          const { configs } = get();
          const existingIndex = configs.findIndex(
            (c) => c.feature === feature && c.operation === operation
          );

          if (existingIndex >= 0) {
            configs[existingIndex] = response.data;
          } else {
            configs.push(response.data);
          }

          set({ configs: [...configs] });
          toast.success('Configuración actualizada');
        } catch (error: any) {
          console.error('Error updating AI config:', error);
          toast.error('Error al actualizar configuración');
        }
      },

      resetConfig: async (feature: AIFeature, operation: AIOperation) => {
        try {
          await aiConfigService.deleteConfig(feature, operation);
          
          // Remover de estado local
          const { configs } = get();
          const filtered = configs.filter(
            (c) => !(c.feature === feature && c.operation === operation)
          );
          
          set({ configs: filtered });
          toast.success('Configuración restaurada al default');
        } catch (error: any) {
          console.error('Error resetting AI config:', error);
          toast.error('Error al restaurar configuración');
        }
      },
    }),
    {
      name: 'ai-config-storage',
      partialize: (state) => ({ configs: state.configs, defaults: state.defaults }),
    }
  )
);
