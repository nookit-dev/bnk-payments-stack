import * as bnk from "@bnk/core";
import type { CRNode, JsonHtmlNodeMap } from "@bnk/core/modules/htmlody";
import { cc } from "@bnk/core/modules/htmlody";

let count = 0;
const lastReset = new Date();

export const getPage = ({
  countDisplay,
}: {
  countDisplay: string;
}): JsonHtmlNodeMap<CRNode> => {
  return {
    HEADER: {
      tag: "header",
      cr: cc(["text-white", "p-8", "text-center", "shadow-md"]),
      attributes: {
        role: "banner",
      },
      children: {
        titleid: {
          tag: "h1",
          cr: cc(["text-4xl", "font-bold", "mb-2"]),
          children: {
            span2: {
              tag: "span",
              cr: cc([
                "text-white",
                "font-bold",
                "text-stroke-1",
                "text-stroke-black",
              ]),
              content: "HTMLody",
            },
          },
          attributes: {
            itemprop: "name",
          },
        },
        subtitleid: {
          tag: "p",
          content: "Plugable and TypeSafe JSON to HTML Generator",
          cr: cc(["text-lg", "font-semibold", "text-black", "p-4"]),
        },
      },
    },
    COUNTER: {
      tag: "section",
      cr: cc(["flex", "flex-col", "justify-center", "items-center", "p-8"]),
      children: {
        titleid: {
          tag: "h2",
          content: "Counter",
          cr: cc(["text-3xl", "font-bold", "mb-4"]),
          attributes: {
            itemprop: "headline",
          },
        },
        counter: {
          tag: "p",
          content: countDisplay,
          cr: cc(["text-3xl", "font-bold", "mb-4"]),
          attributes: {
            id: "counter",
          },
        },
        // last reset
        lastReset: {
          tag: "div",
          children: {
            lastReset: {
              tag: "p",
              content: "Server Rest At: " + lastReset.toString(),
            },
            current: {
              tag: "p",
              content: "Rendered at: " + new Date().toString(),
            },
          },
          cr: cc(["text-3xl", "font-bold", "mb-4"]),
          attributes: {
            id: "last-reset",
          },
        },
      },
    },
  };
};

export const routes = {
  "/": {
    GET: (request) => {
      count++;

      const htmlody = bnk.htmlody.htmlFactory(
        {
          title: "HTMLody template",
        },
        getPage({
          countDisplay: `Count: ${count}`,
        }),
        {}
      );
      const html = htmlody.getHtmlOut();

      return bnk.server.htmlRes(html);
    },
  },

  "^/assets/.+": {
    GET: (request) => {
      const filename = request.url.split("/assets/")[1];
      return new Response(Bun.file(`./src/assets/${filename}`).stream());
    },
  },
} satisfies bnk.server.Routes;
