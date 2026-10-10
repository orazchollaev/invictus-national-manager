import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const ar: LocaleModule = {
  name: "العربية",
  flag: "sa",
  messages: { ...ui, ...engine },
  commentary,
}

export default ar
