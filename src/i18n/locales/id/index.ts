import type { LocaleModule } from "../types"
import commentary from "./commentary"
import engine from "./engine"
import ui from "./ui"

const id: LocaleModule = {
  name: "Bahasa Indonesia",
  flag: "id",
  messages: { ...ui, ...engine },
  commentary,
}

export default id
