// Simple codemirror parser
// This is a simple parser for codemirror that will highlight the syntax of the
import { OrgModeParserConfig } from './config';
import { orgFoldProps } from './folding';
import { orgIndentProps } from './indent';
import { getOrgNodeId } from './node-ids';
import { orgHighlightStyle } from './syntax-highlighting';
import { orgTagsStyles } from './tags';
import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
  syntaxHighlighting,
} from '@codemirror/language';
import { Input, NodeType, Parser, PartialParse, Tree } from '@lezer/common';
import {
  OrgNode,
  NodeType as OrgNodeType,
  parse,
  withMetaInfo,
} from 'org-mode-ast';

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

    const children = orgNode.children ?? sectionChildren;

    const nestedParsedTree = this.tryParseNestedCodeBlock(input, orgNode);
    if (nestedParsedTree) {
      return nestedParsedTree;
    }

    const nodeName = this.getCmNodeNameByOrgNode(orgNode);
    return new Tree(
      NodeType.define({
        id: getOrgNodeId(nodeName),
        name: nodeName,
        top: orgNode.is(OrgNodeType.Root),
        props: [orgTagsStyles, orgFoldProps, orgIndentProps],
      }),
      children?.map((c) => this.convertOrgModeTreeToCmTree(c, input)) ?? [],
      children?.map((c) => c.start - orgNode.start),
      orgNode.length
    );
  }

  private getCmNodeNameByOrgNode(orgNode: OrgNode): string {
    if (
      orgNode.is(OrgNodeType.Title) &&
      orgNode.parent?.is(OrgNodeType.Headline)
    ) {
      return `Headline-${orgNode.parent.level}`;
    }

    if (
      orgNode.is(OrgNodeType.Operator) &&
      orgNode.parent?.parent?.is(OrgNodeType.ListItem) &&
      orgNode?.parent.isNot(OrgNodeType.Section) &&
      (orgNode.value === '- ' || orgNode.value === '+ ')
    ) {
      return 'ListBullet';
    }

    if (
      orgNode.is(OrgNodeType.Text) &&
      orgNode.parent?.is(OrgNodeType.TagList)
    ) {
      return 'FileTag';
    }
    return orgNode.type;
  }

  private tryParseNestedCodeBlock(
    input: string,
    orgNode: OrgNode
  ): Tree | null {
    if (
      !orgNode.is(OrgNodeType.BlockBody) ||
      !orgNode.parent.is(OrgNodeType.SrcBlock, OrgNodeType.HtmlBlock)
    ) {
      return;
    }
    const language = orgNode.parent.properties.language?.toLowerCase();
    const htmlParser = orgNode.parent.is(OrgNodeType.HtmlBlock) ? 'html' : null;

    const nestedParser = this.config?.wrap?.[language ?? htmlParser ?? 'c'];
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
  ]);
}
