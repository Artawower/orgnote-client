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
import {
  Input,
  NodeType,
  Parser,
  PartialParse,
  Tree,
  TreeFragment,
} from '@lezer/common';
import { parser as jsParser } from '@lezer/javascript';
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
    const parsedDoc = parse(doc);

    this.config?.orgAstChanged?.(withMetaInfo(parsedDoc));

    return {
      advance(): Tree | null {
        const tree = convertOrgModeTreeToCmTree(parsedDoc, doc);
        // console.log('✎: [line 53][parser.ts] tree: ', tree);
        // console.log(
        //   '✎: [line 43][parser.ts] parsedDoc: ',
        //   parsedDoc.toString()
        // );
        // console.log('-'.repeat(80));
        return tree;
      },
      parsedPos: input.length,
      stopAt: () => {
        // pass
      },
      stoppedAt: input.length,
    };
  }
}

function convertOrgModeTreeToCmTree(orgNode: OrgNode, input: string): Tree {
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

  if (
    orgNode.is(OrgNodeType.BlockBody) &&
    orgNode.parent.is(OrgNodeType.SrcBlock)
  ) {
    const nestedParser = jsParser.configure({
      props: [orgTagsStyles],
    });
    const parsed = nestedParser.parse(input.slice(orgNode.start, orgNode.end));
    return parsed;
  }

  return new Tree(
    NodeType.define({
      id: getOrgNodeId(orgNode),
      name: orgNode.type,
      top: orgNode.is(OrgNodeType.Root),
      props: [orgTagsStyles, orgFoldProps],
    }),
    children?.map((c) => convertOrgModeTreeToCmTree(c, input)) ?? [],
    children?.map((c) => c.start - orgNode.start),
    orgNode.length
  );
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
