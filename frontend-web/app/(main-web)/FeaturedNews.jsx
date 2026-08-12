import SectionHeader from "./SectionHeader";
import { OverlayNewsCard, CompactNewsCard } from "../Components/NewsCards";

export default function FeaturedNews({
  articles = [],
  title = "प्रमुख समाचार",
  href,
}) {
  if (!articles.length) return null;

  const [lead, ...others] = articles;
  const side = others.slice(0, 2);
  const rest = others.slice(2);

  return (
    <section className="container mx-auto px-4 py-8">
      <SectionHeader title={title} href={href} />

      <div className="grid gap-5 lg:grid-cols-3 lg:auto-rows-fr">
        {/* Lead story */}
        <div className="lg:col-span-2 lg:min-h-96">
          <OverlayNewsCard article={lead} size="lead" fill priority />
        </div>

        {/* Two secondary stories stacked beside the lead */}
        {side.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {side.map((article, index) => (
              <OverlayNewsCard
                key={article._id || index}
                article={article}
                size="small"
                fill
              />
            ))}
          </div>
        )}
      </div>

      {/* Remaining stories */}
      {rest.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article, index) => (
            <CompactNewsCard key={article._id || index} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
