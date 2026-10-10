import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const pt: LocaleModule = {
  name: "Português",
  flag: "pt",
  messages: { ...ui, ...engine },
  commentary,
}

export default pt
