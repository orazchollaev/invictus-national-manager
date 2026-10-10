import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const pl: LocaleModule = {
  name: "Polski",
  flag: "pl",
  messages: { ...ui, ...engine },
  commentary,
}

export default pl
