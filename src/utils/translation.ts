import type { Language } from "../types"
import { englishText } from "../data/translations"

const originalTextNodes = new WeakMap<Text, string>()

export function translateInterface(root: HTMLElement, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode() as Text | null
  while (node) {
    if (!originalTextNodes.has(node))
      originalTextNodes.set(node, node.nodeValue ?? "")
    const original = originalTextNodes.get(node) ?? ""
    const trimmed = original.trim()
    if (trimmed && englishText[trimmed]) {
      const leading = original.match(/^\s*/)?.[0] ?? ""
      const trailing = original.match(/\s*$/)?.[0] ?? ""
      const translated =
        language === "en"
          ? `${leading}${englishText[trimmed]}${trailing}`
          : original
      if (node.nodeValue !== translated) node.nodeValue = translated
    }
    node = (walker.nextNode() as Text | null)
  }
  root.querySelectorAll<HTMLElement>("[placeholder]").forEach((element) => {
    const input = element as HTMLInputElement | HTMLTextAreaElement
    if (!element.dataset.arPlaceholder)
      element.dataset.arPlaceholder = input.placeholder
    const original = element.dataset.arPlaceholder
    input.placeholder =
      language === "en" && englishText[original]
        ? englishText[original]
        : original
  })
}
