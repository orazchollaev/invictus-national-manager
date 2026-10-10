import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const fa: LocaleModule = {
  name: "فارسی",
  flag: "ir",
  messages: { ...ui, ...engine },
  commentary,
}

export default fa
