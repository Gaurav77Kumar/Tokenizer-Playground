export interface LocalExample {
  id: string;
  title: string;
  category: string;
  text: string;
}

export const FALLBACK_EXAMPLES: LocalExample[] = [
  { id: "hello", title: "Hello, world!", category: "Basics", text: "Hello, world!" },
  {
    id: "spaces",
    title: "Spaces matter",
    category: "Basics",
    text: "hello world\nhello  world\nHello, World!",
  },
  {
    id: "numbers",
    title: "Numbers are weird",
    category: "Numbers",
    text: "In 2024, the price was $3.14159, up from 123456789.",
  },
  {
    id: "multilingual",
    title: "English vs the world",
    category: "Multilingual",
    text: "Hello! नमस्ते दुनिया! こんにちは世界! 🌍🚀",
  },
  { id: "emoji", title: "Emoji bytes", category: "Multilingual", text: "I love pizza! 🍕🍕🍕" },
  {
    id: "code",
    title: "Python code",
    category: "Code",
    text: "def add(a, b):\n    return a + b  # add two numbers\n",
  },
  {
    id: "json",
    title: "JSON payload",
    category: "Code",
    text: '{"name": "Ada Lovelace", "age": 36, "languages": ["en", "fr"]}',
  },
  {
    id: "whitespace",
    title: "Whitespace soup",
    category: "Basics",
    text: "Watch   the    spacing.\n\nNew paragraphs matter.\tTabs too.",
  },
  {
    id: "typos",
    title: "Rare words split",
    category: "Subwords",
    text: "unbelievable unbelievable unbeliebable supercalifragilistic",
  },
  {
    id: "special",
    title: "Special tokens",
    category: "Subwords",
    text: "The story ends here. <|endoftext|> Nothing after this is read.",
  },
];
