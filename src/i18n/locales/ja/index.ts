import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const ja: LocaleModule = {
  name: "日本語",
  flag: "jp",
  messages: { ...ui, ...engine },
  commentary,
}

export default ja
