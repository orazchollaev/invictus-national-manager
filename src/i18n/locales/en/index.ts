import type { LocaleModule } from "../types"
import meta from "./meta"
import engine from "./engine"
import ui from "./ui"

const en: LocaleModule = {
  ...meta,
  messages: { ...ui, ...engine },
}

export default en
