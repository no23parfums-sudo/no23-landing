import type { PerfumePresentation } from "../../lib/presentation";
import { SectionHeading } from "./SectionHeading";

type StorySectionProps = {
  story?: PerfumePresentation["story"];
};

/** Long-form editorial article structure. */
export function StorySection({ story }: StorySectionProps) {
  if (!story?.blocks?.length && !story?.intro) return null;

  return (
    <section
      className="archive-section story-section"
      aria-labelledby="story-title"
    >
      <SectionHeading id="story-title" eyebrow="Narrativa" title="Historia" />
      {story.intro ? (
        <p className="story-section__intro">{story.intro}</p>
      ) : null}
      <div className="story-section__blocks">
        {story.blocks?.map((block) => (
          <article key={block.id} className="story-section__block">
            <h3>{block.title}</h3>
            <p>{block.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
