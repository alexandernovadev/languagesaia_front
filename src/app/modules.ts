/**
 * modules — the one place that defines Glota's sections: route, label, icon,
 * hero and color. Navigation, the home screen and placeholders read from here.
 */
import type { IconName } from "../components/Icon/Icon";
import type { Hero } from "../components/Robot/Robot";
import type { Pastel } from "../components/types";

export interface ModuleDef {
  id: "home" | "words" | "expressions" | "review" | "stories" | "exams" | "profile";
  path: string;
  label: string;
  icon: IconName;
  tint: Pastel;
  hero?: Hero;
  /** One line for the home cards. */
  pitch?: string;
}

export const MODULES: Record<ModuleDef["id"], ModuleDef> = {
  home: { id: "home", path: "/", label: "Inicio", icon: "home", tint: "lilac" },
  words: { id: "words", path: "/palabras", label: "Palabras", icon: "words", tint: "sky", hero: "lumi", pitch: "Tu vocabulario, con ejemplos e imágenes." },
  expressions: { id: "expressions", path: "/expresiones", label: "Expresiones", icon: "expressions", tint: "lilac", hero: "nubo", pitch: "Modismos y frases como las dicen de verdad." },
  review: { id: "review", path: "/repasar", label: "Repasar", icon: "review", tint: "mint", hero: "menti", pitch: "Tarjetas justo antes de que las olvides." },
  stories: { id: "stories", path: "/historias", label: "Historias", icon: "stories", tint: "peach", hero: "tula", pitch: "Lee historias a tu nivel, con audio." },
  exams: { id: "exams", path: "/examenes", label: "Exámenes", icon: "exams", tint: "butter", hero: "bruno", pitch: "Ponte a prueba y aprende de cada error." },
  profile: { id: "profile", path: "/perfil", label: "Perfil", icon: "profile", tint: "lilac" },
};

/** Phone bottom bar (Repasar is the big center button). */
export const BOTTOM_NAV = [MODULES.home, MODULES.words, MODULES.review, MODULES.stories, MODULES.exams];
/** Desktop sidebar, in groups. */
export const SIDEBAR = [[MODULES.home, MODULES.review], [MODULES.words, MODULES.expressions, MODULES.stories, MODULES.exams], [MODULES.profile]];

export const LANGUAGES = [
  { value: "en", label: "Inglés", flag: "🇬🇧" },
  { value: "pt", label: "Portugués", flag: "🇧🇷" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "fr", label: "Francés", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
] as const;
