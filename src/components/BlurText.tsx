"use client";

export function BlurText({ text }: { text: string }) {
  return (
    <h1 className="blur-text">
      {text.split(" ").map((word, index) => (
        <span
          key={`${word}-${index}`}
          style={{ animationDelay: `${index * 70}ms` }}
        >
          {word}
          {index < text.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}
