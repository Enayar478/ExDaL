import type { Node } from "unist";
import { visit } from "unist-util-visit";

/**
 * Plugin remark : transforme la directive `::stat[label]{value="38 000 €"}` en
 * un nœud `<stat value="...">label</stat>`, que react-markdown rend via le
 * composant Stat de la DA. La valeur (chiffre) est un attribut ; le label est le
 * contenu `[...]` (apostrophes françaises et ponctuation sans souci). C'est le
 * seul bloc « spécial » du markdown, un par article. Le reste est du Markdown pur.
 */
interface DirectiveNode extends Node {
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

export function remarkStatDirective() {
  return (tree: Node) => {
    visit(tree, (node: Node) => {
      const directive = node as DirectiveNode;
      const isDirective =
        directive.type === "leafDirective" ||
        directive.type === "containerDirective" ||
        directive.type === "textDirective";
      if (!isDirective || directive.name !== "stat") return;

      // La valeur (chiffre) vient de l'attribut ; le label reste le contenu du
      // nœud (children), rendu par le composant Stat.
      const data = directive.data ?? (directive.data = {});
      data.hName = "stat";
      data.hProperties = { value: directive.attributes?.value ?? "" };
    });
  };
}
