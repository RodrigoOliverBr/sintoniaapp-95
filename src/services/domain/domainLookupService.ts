export interface DomainInfo {
  domain: string;
  available: boolean;
  status: string[];
  registrar?: string;
  registrarUrl?: string;
  createdAt?: string;
  expiresAt?: string;
  updatedAt?: string;
  nameservers?: string[];
  registrant?: string;
  rawData?: unknown;
}

export interface DomainLookupResult {
  success: boolean;
  data?: DomainInfo;
  error?: string;
}

function formatDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function extractEventDate(events: Array<{ eventAction: string; eventDate: string }>, action: string): string | undefined {
  const event = events?.find((e) => e.eventAction === action);
  return formatDate(event?.eventDate);
}

export async function lookupDomain(domain: string): Promise<DomainLookupResult> {
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  if (!cleanDomain || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(cleanDomain)) {
    return { success: false, error: "Domínio inválido. Ex: exemplo.com.br" };
  }

  try {
    const response = await fetch(`https://rdap.org/domain/${cleanDomain}`, {
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      return {
        success: true,
        data: {
          domain: cleanDomain,
          available: true,
          status: ["disponível"],
        },
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rdap = await response.json();

    const registrar = rdap.entities?.find((e: { roles: string[] }) =>
      e.roles?.includes("registrar")
    );
    const registrarName =
      registrar?.vcardArray?.[1]?.find((v: string[]) => v[0] === "fn")?.[3] ||
      registrar?.publicIds?.[0]?.identifier ||
      undefined;

    const nameservers: string[] = (rdap.nameservers || []).map(
      (ns: { ldhName: string }) => ns.ldhName?.toLowerCase()
    );

    const status: string[] = (rdap.status || []).map((s: string) =>
      s.replace(/([A-Z])/g, " $1").trim().toLowerCase()
    );

    return {
      success: true,
      data: {
        domain: cleanDomain,
        available: false,
        status,
        registrar: registrarName,
        registrarUrl: registrar?.links?.[0]?.href,
        createdAt: extractEventDate(rdap.events, "registration"),
        expiresAt: extractEventDate(rdap.events, "expiration"),
        updatedAt: extractEventDate(rdap.events, "last changed"),
        nameservers,
        rawData: rdap,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    if (message.includes("fetch") || message.includes("network") || message.toLowerCase().includes("failed")) {
      return { success: false, error: "Não foi possível consultar o domínio. Verifique sua conexão." };
    }
    return { success: false, error: `Erro ao consultar domínio: ${message}` };
  }
}
