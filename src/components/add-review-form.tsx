"use client";

import { useState } from "react";
import { addReview, type ReviewSize } from "@/lib/reviews";

interface Props {
  slug: string;
  onAdded: () => void;
  emphasis?: "default" | "primary";
}

export function AddReviewForm({ slug, onAdded, emphasis = "default" }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [size, setSize] = useState<ReviewSize | "">("");
  const [sent, setSent] = useState(false);

  const valid = rating > 0 && body.trim().length >= 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addReview(slug, {
      rating,
      title: title.trim() || undefined,
      body: body.trim(),
      author: author.trim() || "Anonimowo",
      size: size || undefined,
    });
    setSent(true);
    onAdded();
    setTimeout(() => {
      setRating(0);
      setTitle("");
      setBody("");
      setAuthor("");
      setSize("");
      setSent(false);
    }, 2500);
  };

  const containerClass =
    emphasis === "primary"
      ? "bg-warm-gray/5 border border-charcoal/10 rounded-lg p-6 space-y-4"
      : "bg-warm-gray/5 rounded-lg p-6 space-y-4";

  return (
    <form onSubmit={submit} className={containerClass}>
      <h3 className="text-sm font-medium uppercase tracking-[0.5px]">Dodaj swoją recenzję</h3>

      <div>
        <label className="block text-xs text-warm-gray mb-2">Ocena *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="text-2xl leading-none"
              aria-label={`${s} gwiazdek`}
            >
              <span style={{ color: (hover || rating) >= s ? "#F5A623" : "#D1D5DB" }}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-warm-gray mb-1">Tytuł (opcjonalnie)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-charcoal/15 rounded px-3 py-2 text-sm bg-white"
          maxLength={80}
        />
      </div>

      <div>
        <label className="block text-xs text-warm-gray mb-1">Recenzja *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full border border-charcoal/15 rounded px-3 py-2 text-sm bg-white"
          placeholder="Co Ci się podobało? Co byś poprawił? (min. 10 znaków)"
          minLength={10}
        />
      </div>

      <div>
        <label className="block text-xs text-warm-gray mb-2">Jak wypadł rozmiar?</label>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { v: "runs small" as const, l: "Za mały" },
            { v: "true to size" as const, l: "Na miarę" },
            { v: "runs large" as const, l: "Za duży" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setSize(size === opt.v ? "" : opt.v)}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                size === opt.v
                  ? "bg-charcoal text-white border-charcoal"
                  : "border-charcoal/20 text-charcoal hover:border-charcoal"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-warm-gray mb-1">Twoje imię (opcjonalnie)</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full border border-charcoal/15 rounded px-3 py-2 text-sm bg-white"
          maxLength={40}
          placeholder="Anonimowo"
        />
      </div>

      <button
        type="submit"
        disabled={!valid || sent}
        className="bg-charcoal text-white px-5 py-2.5 rounded text-xs uppercase tracking-[0.5px] disabled:opacity-40 hover:bg-charcoal/90 transition-colors"
      >
        {sent ? "✓ Dziękujemy!" : "Opublikuj recenzję"}
      </button>

      <p className="text-[11px] text-warm-gray/70">
        Recenzja zapisuje się w Twojej przeglądarce (demo bez backendu) — będzie widoczna dla Ciebie do końca sesji.
      </p>
    </form>
  );
}
