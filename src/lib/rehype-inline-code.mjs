import { visit } from "unist-util-visit";

// gatsby-remark-prismjs marked inline code as <code class="language-text">,
// which base/_prism.scss targets via :not(pre) > code[class*="language-"].
// Astro's prism highlighter leaves inline code bare, so restore the class.
export default function rehypeInlineCode() {
  return (tree) => {
    visit(tree, "element", (node, _index, parent) => {
      if (node.tagName !== "code") return;
      if (parent?.type === "element" && parent.tagName === "pre") return;
      if (node.properties?.className) return;
      node.properties = { ...node.properties, className: ["language-text"] };
    });
  };
}
