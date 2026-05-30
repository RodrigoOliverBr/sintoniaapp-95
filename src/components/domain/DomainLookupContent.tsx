import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Globe,
  CheckCircle2,
  XCircle,
  Calendar,
  Server,
  Building2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { lookupDomain, DomainInfo } from "@/services/domain/domainLookupService";
import { toast } from "sonner";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status.includes("active") || status === "disponível";
  const isExpiring = status.includes("expir") || status.includes("delete");
  return (
    <Badge
      className={
        isActive
          ? "bg-green-100 text-green-800 border-green-200"
          : isExpiring
          ? "bg-red-100 text-red-800 border-red-200"
          : "bg-gray-100 text-gray-700 border-gray-200"
      }
      variant="outline"
    >
      {status}
    </Badge>
  );
};

const InfoRow: React.FC<{ label: string; value?: string; icon?: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
};

const DomainResult: React.FC<{ data: DomainInfo }> = ({ data }) => {
  if (data.available) {
    return (
      <div className="flex flex-col items-center py-8 gap-3">
        <CheckCircle2 size={48} className="text-green-500" />
        <h3 className="text-xl font-semibold text-gray-900">{data.domain}</h3>
        <Badge
          className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1"
          variant="outline"
        >
          Disponível para registro
        </Badge>
        <p className="text-sm text-gray-500 text-center max-w-sm mt-1">
          Este domínio não está registrado e pode estar disponível para compra.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <XCircle size={28} className="text-red-500 shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{data.domain}</h3>
          <p className="text-sm text-gray-500">Domínio registrado</p>
        </div>
      </div>

      {data.status.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Status</p>
          <div className="flex flex-wrap gap-2">
            {data.status.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <InfoRow label="Registrador" value={data.registrar} icon={<Building2 size={16} />} />
        <InfoRow label="Criado em" value={data.createdAt} icon={<Calendar size={16} />} />
        <InfoRow label="Expira em" value={data.expiresAt} icon={<Calendar size={16} />} />
        <InfoRow label="Atualizado em" value={data.updatedAt} icon={<Calendar size={16} />} />
      </div>

      {data.nameservers && data.nameservers.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server size={16} className="text-gray-400" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Servidores DNS
              </p>
            </div>
            <div className="space-y-1">
              {data.nameservers.map((ns) => (
                <p key={ns} className="text-sm font-mono text-gray-700 bg-gray-50 rounded px-2 py-1">
                  {ns}
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const DomainLookupContent: React.FC = () => {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DomainInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!domain.trim()) {
      toast.error("Digite um domínio para consultar");
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    const res = await lookupDomain(domain);
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Erro ao consultar domínio");
      return;
    }
    setResult(res.data!);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLookup();
  };

  const handleReset = () => {
    setDomain("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe size={24} className="text-esocial-blue" />
            <div>
              <CardTitle>Consulta de Domínio</CardTitle>
              <CardDescription>
                Verifique disponibilidade e informações de registro via protocolo RDAP
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="exemplo.com.br"
              disabled={isLoading}
              className="flex-1 font-mono"
            />
            <Button
              onClick={handleLookup}
              disabled={isLoading || !domain.trim()}
              className="shrink-0"
            >
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              <span className="ml-2">{isLoading ? "Consultando..." : "Consultar"}</span>
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Dados fornecidos via protocolo RDAP — público e gratuito, sem API key necessária.
          </p>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="pt-6">
            <DomainResult data={result} />
            <div className="mt-4 pt-4 border-t flex justify-end">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Nova consulta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DomainLookupContent;
