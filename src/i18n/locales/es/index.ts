import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const es: LocaleModule = {
  name: "Español",
  flag: "es",
  messages: { ...ui, ...engine },
  commentary,
}

export default es
