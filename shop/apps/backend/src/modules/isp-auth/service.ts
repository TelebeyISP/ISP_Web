import {
  AuthIdentityProviderService,
  AuthenticationInput,
  AuthenticationResponse,
  Logger,
} from "@medusajs/framework/types"
import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils"

type Options = {
  apigateUrl?: string
}

type IspAccount = {
  email: string
  id?: string
}

/**
 * Authenticates Medusa customers with the same Telebey ISP accounts used by
 * the website (ApiGate email/password or an existing access token).
 */
class IspAuthProviderService extends AbstractAuthModuleProvider {
  static identifier = "isp"
  static DISPLAY_NAME = "Telebey ISP"

  protected logger_: Logger
  protected options_: Options

  constructor({ logger }: { logger: Logger }, options: Options = {}) {
    // @ts-ignore Medusa passes the container and options through to the base class.
    super(...arguments)

    this.logger_ = logger
    this.options_ = options
  }

  private apigateUrl() {
    return (
      this.options_.apigateUrl ||
      process.env.APIGATE_URL ||
      "http://127.0.0.1:4000"
    ).replace(/\/$/, "")
  }

  private async resolveIspAccount(
    body: Record<string, unknown> | undefined
  ): Promise<IspAccount> {
    const accessToken =
      typeof body?.access_token === "string" ? body.access_token : ""
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (accessToken) {
      const response = await fetch(`${this.apigateUrl()}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("ISP session is not valid")
      }
      const data = (await response.json()) as {
        user?: { sub?: string; email?: string }
      }
      const verified = data.user?.email?.trim().toLowerCase()
      if (!verified) {
        throw new Error("ISP account has no email")
      }
      return { email: verified, id: data.user?.sub }
    }

    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    const response = await fetch(`${this.apigateUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      throw new Error("Incorrect ISP credentials")
    }
    const data = (await response.json()) as {
      user?: { id?: string; email?: string }
    }
    return {
      email: (data.user?.email || email).trim().toLowerCase(),
      id: data.user?.id,
    }
  }

  private async findOrCreate(
    account: IspAccount,
    authIdentityProviderService: AuthIdentityProviderService
  ) {
    try {
      return await authIdentityProviderService.retrieve({
        entity_id: account.email,
      })
    } catch (error) {
      if (!this.isNotFound(error)) {
        throw error
      }
      return await authIdentityProviderService.create({
        entity_id: account.email,
        provider_metadata: { source: "apigate" },
        user_metadata: {
          email: account.email,
          isp_id: account.id,
        },
      })
    }
  }

  private isNotFound(error: unknown) {
    const type = (error as { type?: string })?.type
    return type === MedusaError.Types.NOT_FOUND
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    try {
      const account = await this.resolveIspAccount(
        data.body as Record<string, unknown> | undefined
      )
      const authIdentity = await this.findOrCreate(
        account,
        authIdentityProviderService
      )
      return { success: true, authIdentity }
    } catch (error) {
      this.logger_.warn(
        `ISP authentication failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : "ISP authentication failed",
      }
    }
  }

  async register(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    try {
      const account = await this.resolveIspAccount(
        data.body as Record<string, unknown> | undefined
      )
      try {
        await authIdentityProviderService.retrieve({
          entity_id: account.email,
        })
        return {
          success: false,
          error: "Identity with email already exists",
        }
      } catch (error) {
        if (!this.isNotFound(error)) {
          throw error
        }
      }
      const authIdentity = await authIdentityProviderService.create({
        entity_id: account.email,
        provider_metadata: { source: "apigate" },
        user_metadata: {
          email: account.email,
          isp_id: account.id,
        },
      })
      return { success: true, authIdentity }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "ISP registration failed",
      }
    }
  }
}

export default IspAuthProviderService
