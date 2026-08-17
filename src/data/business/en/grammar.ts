import { GrammarTopicOption } from "@/types/business";

const grammarTopicsJson: GrammarTopicOption[] = [
  {
    value: "sentence-basics",
    label: "Sentence Basics",
    children: [
      { value: "word-order", label: "Word Order" },
      { value: "questions", label: "Questions" },
      { value: "negation", label: "Negation" },
    ],
  },
  {
    value: "nouns-pronouns",
    label: "Nouns & Pronouns",
    children: [
      {
        value: "countable-uncountable",
        label: "Countable & Uncountable Nouns",
      },
      { value: "articles", label: "Articles" },
      { value: "pronouns", label: "Pronouns" },
      { value: "possessives", label: "Possessives" },
    ],
  },
  {
    value: "adjectives-adverbs",
    label: "Adjectives & Adverbs",
    children: [
      { value: "adjectives", label: "Adjectives" },
      {
        value: "comparatives-superlatives",
        label: "Comparatives & Superlatives",
      },
      { value: "adverbs", label: "Adverbs" },
      { value: "intensifiers", label: "Intensifiers" },
    ],
  },
  {
    value: "verbs-tenses",
    label: "Verbs & Tenses",
    children: [
      { value: "verb-tenses", label: "Verb Tenses (overview)" },
      { value: "past-simple", label: "Past Simple" },
      { value: "past-continuous", label: "Past Continuous" },
      { value: "past-perfect", label: "Past Perfect" },
      { value: "present-simple", label: "Present Simple" },
      { value: "present-continuous", label: "Present Continuous" },
      { value: "present-perfect", label: "Present Perfect" },
      { value: "future-forms", label: "Future Forms" },
      { value: "future-continuous", label: "Future Continuous" },
      { value: "future-perfect", label: "Future Perfect" },
    ],
  },
  {
    value: "special-verbs",
    label: "Special Verbs",
    children: [
      { value: "modal-verbs", label: "Modal Verbs" },
      { value: "past-modals", label: "Past Modals" },
      { value: "auxiliary-verbs", label: "Auxiliary Verbs" },
      { value: "phrasal-verbs", label: "Phrasal Verbs" },
      { value: "conditionals", label: "Conditionals" },
      { value: "passive-voice", label: "Passive Voice" },
      { value: "reported-speech", label: "Reported Speech" },
    ],
  },
  {
    value: "sentence-structure",
    label: "Sentence Structure",
    children: [
      { value: "clauses", label: "Clauses" },
      { value: "relative-clauses", label: "Relative Clauses" },
      { value: "if-clauses", label: "If Clauses" },
      { value: "conjunctions", label: "Conjunctions" },
      { value: "prepositions", label: "Prepositions" },
      { value: "prepositions-of-time", label: "Prepositions of Time" },
    ],
  },
  {
    value: "advanced-grammar",
    label: "Advanced Grammar",
    children: [
      { value: "gerunds-infinitives", label: "Gerunds & Infinitives" },
      { value: "wish-clauses", label: "Wish Clauses" },
      { value: "relative-pronouns", label: "Relative Pronouns" },
      { value: "inversion", label: "Inversion" },
      { value: "subjunctive", label: "Subjunctive" },
    ],
  },
  {
    value: "advanced-structures",
    label: "Advanced Structures",
    children: [
      {
        value: "cleft-sentences",
        label: "Cleft Sentences (It was John who read the book)",
      },
      {
        value: "emphasis-structures",
        label: "Emphasis Structures (What I need is a new car)",
      },
      {
        value: "fronting",
        label: "Fronting (Beautifully written was the book)",
      },
      { value: "narrative-tenses", label: "Narrative Tenses" },
      {
        value: "future-in-the-past",
        label: "Future in the Past (was going to read the book)",
      },
      { value: "mixed-conditionals", label: "Mixed Conditionals" },
      {
        value: "formal-passives",
        label:
          "Formal Passives (It is said that the book was beautifully written)",
      },
      {
        value: "discourse-markers",
        label: "Discourse Markers (however, moreover, nevertheless, so)",
      },
      {
        value: "hedging",
        label: "Hedging (sort of, relatively, arguably, maybe)",
      },
      {
        value: "nominalization",
        label: "Nominalization (decision, analysis, analysis of the book)",
      },
      { value: "academic-style", label: "Academic Style & Register" },
    ],
  },
];

const grammarTopicsList = grammarTopicsJson.flatMap((topic) => topic.children.map((child: { value: string; label: string }) => child.value));

export { grammarTopicsJson, grammarTopicsList };
