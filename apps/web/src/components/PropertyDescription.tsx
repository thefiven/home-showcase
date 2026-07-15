import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import styles from "./PropertyDescription.module.css";

export function PropertyDescription({ content }: { content?: BlocksContent | null }) {
  if (!content || content.length === 0) return null;

  return (
    <div className={styles.description}>
      <BlocksRenderer content={content} />
    </div>
  );
}
