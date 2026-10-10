import type { LocaleModule } from "../types"
import engine from "./engine"
import ui from "./ui"

const en: LocaleModule = {
  name: "English",
  flag: "gb",
  messages: { ...ui, ...engine },
}

export default en
