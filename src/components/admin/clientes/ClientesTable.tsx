import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClienteSistema } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash2, UserX } from "lucide-react";

interface ClientesTableProps {
  clientes: ClienteSistema[];
  isLoading: boolean;
  onEdit: (cliente: ClienteSistema) => void;
  onDelete: (cliente: ClienteSistema) => void;
  onBlock: (cliente: ClienteSistema) => void;
}

const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
  isLoading,
  onEdit,
  onDelete,
  onBlock,
}) => {
  const columns: ColumnDef<ClienteSistema>[] = [
    {
      accessorKey: "razao_social",
      header: "Razão Social",
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "telefone",
      header: "Telefone",
    },
    {
      accessorKey: "situacao",
      header: "Situação",
      cell: ({ row }) => {
        const situacao = row.getValue("situacao");
        let badgeVariant = "default";
        if (situacao === "ativo") {
          badgeVariant = "success";
        } else if (situacao === "inativo") {
          badgeVariant = "destructive";
        } else if (situacao === "sem-contrato") {
          badgeVariant = "secondary";
        } else if (situacao === "bloqueado") {
          badgeVariant = "destructive";
        }

        return <Badge variant={badgeVariant}>{situacao}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const cliente = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(cliente)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBlock(cliente)}>
                <UserX className="mr-2 h-4 w-4" />
                Bloquear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(cliente)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: clientes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <tr>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center italic"
              >
                Carregando clientes...
              </TableCell>
            </tr>
          ) : clientes.length === 0 ? (
            <tr>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center italic"
              >
                Nenhum cliente encontrado.
              </TableCell>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientesTable;
