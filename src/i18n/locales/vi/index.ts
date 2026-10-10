import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const vi: LocaleModule = {
  name: "Tiếng Việt",
  flag: "vn",
  messages: { ...ui, ...engine },
  commentary,
}

export default vi
