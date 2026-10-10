import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const hi: LocaleModule = {
  name: "हिन्दी",
  flag: "in",
  messages: { ...ui, ...engine },
  commentary,
}

export default hi
