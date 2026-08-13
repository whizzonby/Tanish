import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// Blog content is only ever written by an authenticated admin, but it's
// still rendered to every site visitor — sanitize as defense in depth in
// case an admin account is ever compromised.
export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false, gfm: true, breaks: true });
  return DOMPurify.sanitize(rawHtml);
}
