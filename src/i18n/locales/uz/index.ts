import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const uz: LocaleModule = {
  name: "O‘zbekcha",
  flag: "uz",
  messages: { ...ui, ...engine },
  commentary,
}

export default uz
