import { GrammarTopicOption } from "@/types/business";

const grammarTopicsJson: GrammarTopicOption[] = [
  {
    value: "sentence-basics",
    label: "Fundamentos da Frase",
    children: [
      { value: "word-order", label: "Ordem das Palavras" },
      { value: "questions", label: "Perguntas" },
      { value: "negation", label: "Negação" },
    ],
  },
  {
    value: "nouns-pronouns",
    label: "Substantivos e Pronomes",
    children: [
      { value: "gender-number", label: "Gênero e Número" },
      { value: "articles", label: "Artigos" },
      { value: "pronouns", label: "Pronomes" },
      { value: "possessives", label: "Possessivos" },
    ],
  },
  {
    value: "adjectives-adverbs",
    label: "Adjetivos e Advérbios",
    children: [
      { value: "adjectives", label: "Adjetivos" },
      { value: "comparatives-superlatives", label: "Comparativos e Superlativos" },
      { value: "adverbs", label: "Advérbios" },
      { value: "intensifiers", label: "Intensificadores" },
    ],
  },
  {
    value: "verbs-tenses",
    label: "Verbos e Tempos",
    children: [
      { value: "past-indicative", label: "Pretérito do Indicativo" },
      { value: "present-indicative", label: "Presente do Indicativo" },
      { value: "future-indicative", label: "Futuro do Indicativo" },
      { value: "conditional", label: "Condicional" },
      { value: "past-subjunctive", label: "Pretérito do Subjuntivo" },
      { value: "present-subjunctive", label: "Presente do Subjuntivo" },
      { value: "imperative", label: "Imperativo" },
      { value: "gerund", label: "Gerúndio" },
      { value: "participle", label: "Particípio" },
    ],
  },
  {
    value: "special-verbs",
    label: "Verbos Especiais",
    children: [
      { value: "ser-estar", label: "Ser e Estar" },
      { value: "ter-haver", label: "Ter e Haver" },
      { value: "reflexive-verbs", label: "Verbos Reflexivos" },
      { value: "modal-verbs", label: "Verbos Modais" },
      { value: "passive-voice", label: "Voz Passiva" },
      { value: "reported-speech", label: "Discurso Indireto" },
    ],
  },
  {
    value: "sentence-structure",
    label: "Estrutura da Frase",
    children: [
      { value: "clauses", label: "Orações Subordinadas" },
      { value: "relative-clauses", label: "Orações Relativas" },
      { value: "conditional-clauses", label: "Orações Condicionais" },
      { value: "conjunctions", label: "Conjunções" },
      { value: "prepositions", label: "Preposições" },
    ],
  },
  {
    value: "advanced-grammar",
    label: "Gramática Avançada",
    children: [
      { value: "subjunctive-uses", label: "Usos do Subjuntivo" },
      { value: "conditional-complex", label: "Condicionais Complexos" },
      { value: "relative-pronouns", label: "Pronomes Relativos" },
      { value: "inversion", label: "Inversão" },
      { value: "ellipsis", label: "Elipse" },
    ],
  },
  {
    value: "advanced-structures",
    label: "Estruturas Avançadas",
    children: [
      { value: "cleft-sentences", label: "Frases Hendidas" },
      { value: "emphasis-structures", label: "Estruturas de Ênfase" },
      { value: "fronting", label: "Anteposição" },
      { value: "narrative-tenses", label: "Tempos Narrativos" },
      { value: "discourse-markers", label: "Marcadores do Discurso" },
      { value: "hedging", label: "Hedging" },
      { value: "nominalization", label: "Nominalização" },
      { value: "academic-style", label: "Estilo Acadêmico" },
    ],
  },
];

const grammarTopicsList = grammarTopicsJson.flatMap((topic) => topic.children.map((child: { value: string; label: string }) => child.value));

export { grammarTopicsJson, grammarTopicsList };
