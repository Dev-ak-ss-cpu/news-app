// Renders a <script type="application/ld+json"> tag for structured data.
// `<` is escaped so article titles/excerpts (user-supplied CMS content)
// can't break out of the script tag.
export default function JsonLd({ data }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
