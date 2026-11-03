from app.schemas import ExampleItem

EXAMPLES: list[ExampleItem] = [
    ExampleItem(
        id="hello",
        title="Hello, world!",
        category="Basics",
        text="Hello, world!",
        note="The classic first sentence — see how punctuation gets its own token.",
    ),
    ExampleItem(
        id="spaces",
        title="Spaces matter",
        category="Basics",
        text="hello world\nhello  world\nHello, World!",
        note="Compare 'hello', ' hello' and 'Hello' — leading spaces and casing change the token.",
    ),
    ExampleItem(
        id="numbers",
        title="Numbers are weird",
        category="Numbers",
        text="In 2024, the price was $3.14159, up from 123456789.",
        note="Digits split unpredictably — '2024' and '123456789' behave very differently.",
    ),
    ExampleItem(
        id="multilingual",
        title="English vs the world",
        category="Multilingual",
        text="Hello! नमस्ते दुनिया! こんにちは世界! 🌍🚀",
        note="English, Hindi, Japanese and emoji — the same idea can cost wildly different token counts.",
    ),
    ExampleItem(
        id="emoji",
        title="Emoji bytes",
        category="Multilingual",
        text="I love pizza! 🍕🍕🍕",
        note="In older tokenizers a single emoji can split into 2–4 byte-level pieces.",
    ),
    ExampleItem(
        id="code",
        title="Python code",
        category="Code",
        text="def add(a, b):\n    return a + b  # add two numbers\n",
        note="Code is very token-dense: indentation and symbols each take tokens.",
    ),
    ExampleItem(
        id="json",
        title="JSON payload",
        category="Code",
        text='{"name": "Ada Lovelace", "age": 36, "languages": ["en", "fr"]}',
        note="Braces, quotes and colons add up fast — JSON is token-expensive.",
    ),
    ExampleItem(
        id="whitespace",
        title="Whitespace soup",
        category="Basics",
        text="Watch   the    spacing.\n\nNew paragraphs matter.\tTabs too.",
        note="Runs of spaces, newlines and tabs are tokens too — and they all cost money.",
    ),
    ExampleItem(
        id="typos",
        title="Rare words split",
        category="Subwords",
        text="unbelievable unbelievable unbeliebable supercalifragilistic",
        note="A rare or misspelled word shatters into subword pieces; the common one stays whole.",
    ),
    ExampleItem(
        id="special",
        title="Special tokens",
        category="Subwords",
        text="The story ends here. <|endoftext|> Nothing after this is read.",
        note="Special tokens like <|endoftext|> are single reserved ids — models treat them as signals, not text.",
    ),
]
