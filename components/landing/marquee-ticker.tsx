const models = [
  'Gemini 2.0',
  'GPT-4',
  'Claude',
  'Mistral',
  'Custom Instructions',
  'Multi-Companion',
  'Markdown Chat',
  'Smart Suggestions',
];

export function MarqueeTicker() {
  const items = [...models, ...models];

  return (
    <div className="overflow-hidden border-y border-border/40 bg-muted/20 py-4">
      <div className="landing-ticker flex w-max gap-8">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="whitespace-nowrap text-sm font-semibold text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee() {
  const tags = [
    'Code Writer',
    'Email Writer',
    'Fitness Coach',
    'Bug Fixer',
    'Personal Tutor',
    'YouTube Script Writer',
    'Grammar Fixer',
    'Finance Advisor',
  ];
  const items = [...tags, ...tags];

  return (
    <section className="border-y border-border/40 bg-muted/20 py-8">
      <div className="overflow-hidden">
        <div className="landing-marquee flex w-max gap-12 px-4">
          {items.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="whitespace-nowrap text-sm font-semibold text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
