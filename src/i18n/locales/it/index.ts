import type { LocaleModule } from "../types"
import meta from "./meta"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const it: LocaleModule = {
  ...meta,
  messages: { ...ui, ...engine },
  commentary,
}

export default it
