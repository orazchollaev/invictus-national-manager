import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const it: LocaleModule = {
  name: "Italiano",
  flag: "it",
  messages: { ...ui, ...engine },
  commentary,
}

export default it
