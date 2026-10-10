import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const th: LocaleModule = {
  name: "ไทย",
  flag: "th",
  messages: { ...ui, ...engine },
  commentary,
}

export default th
