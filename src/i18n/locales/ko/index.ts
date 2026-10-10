import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const ko: LocaleModule = {
  name: "한국어",
  flag: "kr",
  messages: { ...ui, ...engine },
  commentary,
}

export default ko
