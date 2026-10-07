import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import IspAuthProviderService from "./service"

export default ModuleProvider(Modules.AUTH, {
  services: [IspAuthProviderService],
})
