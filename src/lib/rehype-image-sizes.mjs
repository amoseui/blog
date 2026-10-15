import { visit } from "unist-util-visit";

// Match the post's mobile gutters and desktop sidebar/content columns.
const CONTENT_SIZES =
  "(min-width: 1070px) 690px, (min-width: 960px) calc(100vw - 380px), calc(100vw - 37.5px)";

export default function rehypeImageSizes() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img" || node.properties.sizes) return;
      node.properties.sizes = CONTENT_SIZES;
    });
  };
}
