import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tokenizer Playground — see how AI reads your text",
  description:
    "Type any text and watch GPT-4o, GPT-2, BERT, T5 and RoBERTa tokenizers split it into colorful tokens. Learn how tokenization shapes cost, context windows and model behavior.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
