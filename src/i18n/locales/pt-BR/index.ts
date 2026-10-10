import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const ptBR: LocaleModule = {
  name: "Português (Brasil)",
  flag: "br",
  messages: { ...ui, ...engine },
  commentary,
}

export default ptBR
