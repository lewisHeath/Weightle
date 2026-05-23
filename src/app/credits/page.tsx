import { objects } from "@/lib/data";

export default function CreditsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="mt-2 text-muted-foreground">
          Object images are sourced from Wikimedia Commons. Mass values are
          curated estimates with stated qualifiers and linked sources.
        </p>
      </div>
      <ul className="space-y-4">
        {objects.map((obj) => (
          <li key={obj.id} className="border-b pb-4 text-sm last:border-0">
            <p className="font-medium">{obj.name}</p>
            <p className="text-muted-foreground">{obj.attribution}</p>
            <p className="text-muted-foreground">{obj.qualifier}</p>
            <a
              href={obj.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Source
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
