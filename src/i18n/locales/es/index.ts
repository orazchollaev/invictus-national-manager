import type { LocaleModule } from "../types"
import meta from "./meta"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const es: LocaleModule = {
  ...meta,
  messages: { ...ui, ...engine },
  commentary,
}

export default es
