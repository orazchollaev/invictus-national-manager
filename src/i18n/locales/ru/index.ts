import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const ru: LocaleModule = {
  name: "Русский",
  flag: "ru",
  messages: { ...ui, ...engine },
  commentary,
}

export default ru
