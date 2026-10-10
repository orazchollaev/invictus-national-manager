import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const fr: LocaleModule = {
  name: "Français",
  flag: "fr",
  messages: { ...ui, ...engine },
  commentary,
}

export default fr
