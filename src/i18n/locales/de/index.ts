import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const de: LocaleModule = {
  name: "Deutsch",
  flag: "de",
  messages: { ...ui, ...engine },
  commentary,
}

export default de
