import {
  Settings,
  BookOpen,
  RotateCcw,
  Users,
  BookMarked,
  FileDown,
  FileUp,
  FileSpreadsheet,
  Info,
  Quote,
  Sparkles,
  FileCode,
  ClipboardList,
  FileEdit,
  BookOpenText,
  BookPlus,
} from "lucide-react";

export const menuItems = [
  {
    title: "Lecturas",
    url: "/lectures",
    icon: BookOpen,
  },
  {
    title: "Historias",
    url: "/stories",
    icon: BookOpenText,
  },
  {
    title: "Exámenes",
    url: "/exams",
    icon: ClipboardList,
  },
  {
    title: "Mis Palabras",
    url: "/my-words",
    icon: BookMarked,
  },
  {
    title: "Mis Expresiones",
    url: "/my-expressions",
    icon: Quote,
  },
];

export const generatorItems = [
  {
    title: "Generador de Exámenes",
    url: "/exams/generator",
    icon: FileEdit,
  },
  {
    title: "Generador de Historias",
    url: "/stories/create",
    icon: BookPlus,
  },
];

export const gamesItems = [
  {
    title: "Juego Anki",
    url: "/games/anki",
    icon: RotateCcw,
  },
];

export const configSettingsItems = [
  {
    title: "Usuarios",
    url: "/users",
    icon: Users,
  },
  {
    title: "Configuración de AI",
    url: "/settings/ai-config",
    icon: Sparkles,
  },
  {
    title: "Importar",
    url: "/settings/import",
    icon: FileUp,
  },
  {
    title: "Exportar",
    url: "/settings/export",
    icon: FileDown,
  },
  {
    title: "Labs",
    url: "/settings/labs",
    icon: Settings,
  },
  {
    title: "Información del Sistema",
    url: "/settings/system",
    icon: Info,
  },
];
