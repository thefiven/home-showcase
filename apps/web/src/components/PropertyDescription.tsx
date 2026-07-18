import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import type { BlocksContent } from "@strapi/blocks-react-renderer";

export function PropertyDescription({ content }: { content?: BlocksContent | null }) {
  if (!content || content.length === 0) return null;

  return (
    <div className="flex max-w-[58ch] flex-col gap-8 leading-normal text-foreground-muted">
      <BlocksRenderer content={content} />
    </div>
  );
}
