import { GrammarTopicOption } from "@/types/business";

const grammarTopicsJson: GrammarTopicOption[] = [
  {
    value: "sentence-basics",
    label: "Fundamentos de la Oración",
    children: [
      { value: "word-order", label: "Orden de Palabras" },
      { value: "questions", label: "Preguntas" },
      { value: "negation", label: "Negación" },
    ],
  },
  {
    value: "nouns-pronouns",
    label: "Sustantivos y Pronombres",
    children: [
      { value: "gender-number", label: "Género y Número" },
      { value: "articles", label: "Artículos" },
      { value: "pronouns", label: "Pronombres" },
      { value: "possessives", label: "Posesivos" },
    ],
  },
  {
    value: "adjectives-adverbs",
    label: "Adjetivos y Adverbios",
    children: [
      { value: "adjectives", label: "Adjetivos" },
      { value: "comparatives-superlatives", label: "Comparativos y Superlativos" },
      { value: "adverbs", label: "Adverbios" },
      { value: "intensifiers", label: "Intensificadores" },
    ],
  },
  {
    value: "verbs-tenses",
    label: "Verbos y Tiempos",
    children: [
      { value: "past-indicative", label: "Pasado de Indicativo" },
      { value: "present-indicative", label: "Presente de Indicativo" },
      { value: "future-indicative", label: "Futuro de Indicativo" },
      { value: "conditional", label: "Condicional" },
      { value: "past-subjunctive", label: "Pasado de Subjuntivo" },
      { value: "present-subjunctive", label: "Presente de Subjuntivo" },
      { value: "imperative", label: "Imperativo" },
      { value: "gerund", label: "Gerundio" },
      { value: "participle", label: "Participio" },
    ],
  },
  {
    value: "special-verbs",
    label: "Verbos Especiales",
    children: [
      { value: "ser-estar", label: "Ser y Estar" },
      { value: "haber", label: "Haber" },
      { value: "reflexive-verbs", label: "Verbos Reflexivos" },
      { value: "modal-verbs", label: "Verbos Modales" },
      { value: "passive-voice", label: "Voz Pasiva" },
      { value: "reported-speech", label: "Estilo Indirecto" },
    ],
  },
  {
    value: "sentence-structure",
    label: "Estructura de la Oración",
    children: [
      { value: "clauses", label: "Oraciones Subordinadas" },
      { value: "relative-clauses", label: "Oraciones Relativas" },
      { value: "conditional-clauses", label: "Oraciones Condicionales" },
      { value: "conjunctions", label: "Conjunciones" },
      { value: "prepositions", label: "Preposiciones" },
    ],
  },
  {
    value: "advanced-grammar",
    label: "Gramática Avanzada",
    children: [
      { value: "subjunctive-uses", label: "Usos del Subjuntivo" },
      { value: "conditional-complex", label: "Condicionales Complejos" },
      { value: "relative-pronouns", label: "Pronombres Relativos" },
      { value: "inversion", label: "Inversión" },
      { value: "ellipsis", label: "Elipsis" },
    ],
  },
  {
    value: "advanced-structures",
    label: "Estructuras Avanzadas",
    children: [
      { value: "cleft-sentences", label: "Oraciones Hendidas" },
      { value: "emphasis-structures", label: "Estructuras de Énfasis" },
      { value: "fronting", label: "Anteposición" },
      { value: "narrative-tenses", label: "Tiempos Narrativos" },
      { value: "discourse-markers", label: "Marcadores del Discurso" },
      { value: "hedging", label: "Hedging" },
      { value: "nominalization", label: "Nominalización" },
      { value: "academic-style", label: "Estilo Académico" },
    ],
  },
];

const grammarTopicsList = grammarTopicsJson.flatMap((topic) => topic.children.map((child: { value: string; label: string }) => child.value));

export { grammarTopicsJson, grammarTopicsList };
