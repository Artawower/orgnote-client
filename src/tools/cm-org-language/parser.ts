// Simple codemirror parser
// This is a simple parser for codemirror that will highlight the syntax of the
import {
  Language,
  LanguageSupport,
  codeFolding,
  defineLanguageFacet,
  foldGutter,
  syntaxHighlighting,
} from '@codemirror/language';
import { Input, NodeType, Parser, PartialParse, Tree } from '@lezer/common';
import {
  OrgNode,
  NodeType as OrgNodeType,
  parse,
  withMetaInfo,
} from 'org-mode-ast';

import { OrgModeParserConfig } from './config';
import { orgFoldProps } from './folding';
import { getOrgNodeId } from './node-ids';
import { orgHighlightStyle } from './syntax-highlighting';
import { orgTagsStyles } from './tags';

class OrgNodeParser extends Parser {
  constructor(private config?: OrgModeParserConfig) {
    super();
  }
  createParse(input: Input): PartialParse {
    const doc = input.read(0, input.length);
    const parsedDoc = withMetaInfo(parse(doc));

    this.config?.orgAstChanged?.(parsedDoc);

    return {
      advance: (): Tree | null => {
        const tree = this.convertOrgModeTreeToCmTree(parsedDoc, doc);
        // console.log(
        //   '✎: [line 43][parser.ts] parsedDoc: ',
        //   parsedDoc.toString()
        // );
        return tree;
      },
      parsedPos: input.length,
      stopAt: () => {
        // pass
      },
      stoppedAt: input.length,
    };
  }

  private convertOrgModeTreeToCmTree(orgNode: OrgNode, input: string): Tree {
    const sectionChildren = [];
    if (orgNode.title) {
      sectionChildren.push(orgNode.title);
    }

    if (orgNode.section) {
      sectionChildren.push(orgNode.section);
    }

    const children = (orgNode.children ?? sectionChildren).filter((c) =>
      c.isNot(OrgNodeType.Text)
    );

    const nestedParsedTree = this.tryParseNestedCodeBlock(input, orgNode);
    if (nestedParsedTree) {
      return nestedParsedTree;
    }

    return new Tree(
      NodeType.define({
        id: getOrgNodeId(orgNode),
        name: orgNode.type,
        top: orgNode.is(OrgNodeType.Root),
        props: [orgTagsStyles, orgFoldProps],
      }),
      children?.map((c) => this.convertOrgModeTreeToCmTree(c, input)) ?? [],
      children?.map((c) => c.start - orgNode.start),
      orgNode.length
    );
  }

  private tryParseNestedCodeBlock(
    input: string,
    orgNode: OrgNode
  ): Tree | null {
    if (
      !orgNode.is(OrgNodeType.BlockBody) ||
      !orgNode.parent.is(OrgNodeType.SrcBlock)
    ) {
      return;
    }
    const language = orgNode.parent.properties.language;

    const nestedParser = this.config?.wrap?.[language];
    if (!nestedParser) {
      return;
    }
    const parsed = nestedParser.parse(input.slice(orgNode.start, orgNode.end));
    return parsed;
  }
}

function initLanguage(config?: OrgModeParserConfig): Language {
  const facet = defineLanguageFacet();
  const parser = new OrgNodeParser(config);
  const orgModeLanguage = new Language(facet, parser, [], 'org-mode');
  return orgModeLanguage;
}

export function orgMode(config?: OrgModeParserConfig): LanguageSupport {
  return new LanguageSupport(initLanguage(config), [
    syntaxHighlighting(orgHighlightStyle),
    codeFolding(),
    foldGutter(),
  ]);
}