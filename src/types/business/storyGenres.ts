export type StoryGenre =
  | "mystery"
  | "sci-fi"
  | "romance"
  | "adventure"
  | "fantasy"
  | "horror"
  | "drama"
  | "comedy"
  | "thriller"
  | "historical";

export const storyGenres: { value: StoryGenre; label: string }[] = [
  { value: "mystery", label: "Mystery" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "romance", label: "Romance" },
  { value: "adventure", label: "Adventure" },
  { value: "fantasy", label: "Fantasy" },
  { value: "horror", label: "Horror" },
  { value: "drama", label: "Drama" },
  { value: "comedy", label: "Comedy" },
  { value: "thriller", label: "Thriller" },
  { value: "historical", label: "Historical" },
];
