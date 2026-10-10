import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const nl: LocaleModule = {
  name: "Nederlands",
  flag: "nl",
  messages: { ...ui, ...engine },
  commentary,
}

export default nl
