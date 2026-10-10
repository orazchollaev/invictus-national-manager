import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const tr: LocaleModule = {
  name: "Türkçe",
  flag: "tr",
  messages: { ...ui, ...engine },
  commentary,
}

export default tr
