import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Monitor,
  Phone,
  Network,
  Printer,
  Users,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
  Wrench,
  FileDown,
  Shield,
  LogOut,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  MACHINE_CATEGORIES,
  type MachineCategory,
  type Machine,
} from "@/lib/schema";

const machineFormSchema = z.object({
  machineId: z.string().min(1, "Nome do dispositivo é obrigatório"),
  category: z.enum(MACHINE_CATEGORIES).default("computador"),
  macAddress: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  patrimonio: z.string().optional(),
  collaborator: z.string().nullable().optional(),
  broken: z.boolean().optional().default(false),
});

type MachineFormValues = z.infer<typeof machineFormSchema>;

type FilterStatus =
  | "all"
  | "assigned"
  | "unassigned"
  | "computador"
  | "telefone"
  | "switch"
  | "impressora"
  | "palo_alto"
  | "quebradas";

const categoryLabel: Record<MachineCategory, string> = {
  computador: "Computador",
  telefone: "Telefone",
  switch: "Switch",
  impressora: "Impressora",
  palo_alto: "Palo Alto",
};

const CategoryIcon = ({
  category,
  className,
}: {
  category: string;
  className?: string;
}) => {
  switch (category) {
    case "telefone":
      return <Phone className={className} />;
    case "switch":
      return <Network className={className} />;
    case "impressora":
      return <Printer className={className} />;
    case "palo_alto":
      return <Shield className={className} />;
    default:
      return <Monitor className={className} />;
  }
};

export default function Home() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [editingCollaborator, setEditingCollaborator] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const isCancelingRef = useRef(false);

  const defaultFormValues: MachineFormValues = {
    machineId: "",
    category: "computador",
    macAddress: "",
    serialNumber: "",
    collaborator: "",
    broken: false,
  };

  const addForm = useForm<MachineFormValues>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: defaultFormValues,
  });

  const editForm = useForm<MachineFormValues>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: defaultFormValues,
  });

  const watchAddCategory = addForm.watch("category");
  const watchEditCategory = editForm.watch("category");

  const { data: machines = [], isLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: MachineFormValues) => {
      return apiRequest("POST", "/api/machines", {
        ...data,
        macAddress: data.macAddress || null,
        serialNumber: data.serialNumber || null,
        collaborator: data.collaborator || null,
        broken: data.broken ?? false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      setIsAddDialogOpen(false);
      addForm.reset(defaultFormValues);
      toast({
        title: "Sucesso",
        description: "Dispositivo cadastrada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao cadastrar o dispositivo",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<MachineFormValues>;
    }) => {
      const payload = {
        ...data,
        macAddress: data.macAddress === "" ? null : data.macAddress,
        serialNumber: data.serialNumber === "" ? null : data.serialNumber,
        collaborator: data.collaborator === "" ? null : data.collaborator,
      };
      return apiRequest("PATCH", `/api/machines/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      setIsEditDialogOpen(false);
      setSelectedMachine(null);
      setEditingCollaborator(null);
      editForm.reset(defaultFormValues);
      toast({
        title: "Sucesso",
        description: "Dispositivo atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar o dispositivo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/machines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      setIsDeleteDialogOpen(false);
      setSelectedMachine(null);
      toast({ title: "Sucesso", description: "Dispositivo removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover dispositivo",
        variant: "destructive",
      });
    },
  });

  const exportToExcel = () => {
    const categoryLabelMap: Record<string, string> = {
      computador: "Computador",
      telefone: "Telefone",
      switch: "Switch",
      impressora: "Impressora",
      palo_alto: "Palo Alto",
    };
    const rows = filteredMachines.map((m) => ({
      "Nome do Dispositivo": m.machineId,
      Categoria: categoryLabelMap[m.category || "computador"] ?? m.category,
      "Endereço MAC / ID do Produto": m.macAddress ?? "",
      Patrimônio: m.patrimonio ?? "",
      "Número de Série": m.serialNumber ?? "",
      Colaborador: m.collaborator ?? "",
      Status: m.broken
        ? "Quebrada"
        : m.collaborator
          ? "Atribuída"
          : "Sem atribuição",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = [
      { wch: 22 },
      { wch: 14 },
      { wch: 28 },
      { wch: 18 },
      { wch: 30 },
      { wch: 16 },
    ];
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventário TI");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    XLSX.writeFile(wb, `inventario_ti_${stamp}.xlsx`);
  };

  const filteredMachines = machines.filter((machine) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      machine.machineId.toLowerCase().includes(searchLower) ||
      (machine.macAddress?.toLowerCase().includes(searchLower) ?? false) ||
      (machine.serialNumber?.toLowerCase().includes(searchLower) ?? false) ||
      (machine.collaborator?.toLowerCase().includes(searchLower) ?? false);

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "assigned" && !!machine.collaborator) ||
      (filterStatus === "unassigned" && !machine.collaborator) ||
      (filterStatus === "computador" && machine.category === "computador") ||
      (filterStatus === "telefone" && machine.category === "telefone") ||
      (filterStatus === "switch" && machine.category === "switch") ||
      (filterStatus === "impressora" && machine.category === "impressora") ||
      (filterStatus === "palo_alto" && machine.category === "palo_alto") ||
      (filterStatus === "quebradas" && machine.broken);

    return matchesSearch && matchesFilter;
  });

  const totalMachines = machines.length;
  const assignedMachines = machines.filter((m) => m.collaborator).length;
  const unassignedMachines = machines.filter((m) => !m.collaborator).length;
  const brokenMachines = machines.filter((m) => m.broken).length;
  const computerCount = machines.filter(
    (m) => m.category === "computador",
  ).length;
  const phoneCount = machines.filter((m) => m.category === "telefone").length;
  const switchCount = machines.filter((m) => m.category === "switch").length;
  const printerCount = machines.filter(
    (m) => m.category === "impressora",
  ).length;
  const paloAltoCount = machines.filter(
    (m) => m.category === "palo_alto",
  ).length;

  const handleInlineEdit = (machine: Machine) => {
    setEditingCollaborator({
      id: machine.id,
      value: machine.collaborator || "",
    });
  };

  const handleInlineSave = () => {
    if (isCancelingRef.current) {
      isCancelingRef.current = false;
      return;
    }
    if (editingCollaborator) {
      updateMutation.mutate({
        id: editingCollaborator.id,
        data: { collaborator: editingCollaborator.value || null },
      });
    }
  };

  const handleInlineCancel = () => {
    isCancelingRef.current = true;
    setEditingCollaborator(null);
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInlineSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleInlineCancel();
    }
  };

  const openEditDialog = (machine: Machine) => {
    setSelectedMachine(machine);
    editForm.reset({
      machineId: machine.machineId,
      category: (machine.category as MachineCategory) || "computador",
      macAddress: machine.macAddress || "",
      serialNumber: machine.serialNumber || "",
      collaborator: machine.collaborator || "",
      broken: machine.broken ?? false,
    });
    setIsEditDialogOpen(true);
  };

  const onAddSubmit = (data: MachineFormValues) => {
    createMutation.mutate(data);
  };
  const onEditSubmit = (data: MachineFormValues) => {
    if (selectedMachine) {
      updateMutation.mutate({ id: selectedMachine.id, data });
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-background"
        data-testid="loading-state"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground" data-testid="text-loading">
            Carregando dispositivos...
          </p>
        </div>
      </div>
    );
  }

  const DynamicFormFields = ({
    form,
    watchCategory,
  }: {
    form: typeof addForm;
    watchCategory: MachineCategory;
  }) => (
    <>
      {watchCategory === "computador" && (
        <>
          <FormField
            control={form.control}
            name="macAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID do Produto</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: 12345-6789-12345-ABCD"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-mac-address"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patrimonio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patrimônio</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: PAT-000123"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-patrimonio"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {watchCategory === "telefone" && (
        <>
          <FormField
            control={form.control}
            name="macAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço MAC</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: AA:BB:CC:DD:EE:FF"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-mac-address"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: SN-123456"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-serial-number"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patrimonio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patrimônio</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: PAT-000123"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-patrimonio"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {watchCategory === "impressora" && (
        <>
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: SN-123456"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-serial-number"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patrimonio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patrimônio</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: PAT-000123"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-patrimonio"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <div
  className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden"
  data-testid="logo"
>
  <img src="/logo-sedcon.png" alt="Brasão SEDCON" className="h-full w-full object-contain" />
</div>
            <div>
              <h1 className="text-lg font-semibold" data-testid="text-title">
                Cadastro de Dispositivos SEDCON
              </h1>
              <p
                className="text-sm text-muted-foreground"
                data-testid="text-subtitle"
              >
                Gerenciamento de equipamentos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={logout}
              data-testid="button-logout"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          <Card data-testid="card-total-machines">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold"
                data-testid="text-total-machines"
              >
                {totalMachines}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-assigned-machines">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atribuídas
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold text-primary"
                data-testid="text-assigned-machines"
              >
                {assignedMachines}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-unassigned-machines">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sem Atribuição
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold text-muted-foreground"
                data-testid="text-unassigned-machines"
              >
                {unassignedMachines}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-broken-machines">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quebradas
              </CardTitle>
              <Wrench className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold text-destructive"
                data-testid="text-broken-machines"
              >
                {brokenMachines}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category mini-stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 mb-8">
          {(
            [
              "computador",
              "telefone",
              "switch",
              "impressora",
              "palo_alto",
            ] as MachineCategory[]
          ).map((cat) => {
            const counts: Record<MachineCategory, number> = {
              computador: computerCount,
              telefone: phoneCount,
              switch: switchCount,
              impressora: printerCount,
              palo_alto: paloAltoCount,
            };
            return (
              <button
                key={cat}
                onClick={() => setFilterStatus(cat)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${filterStatus === cat ? "border-primary bg-primary/5" : ""}`}
                data-testid={`stat-category-${cat}`}
              >
                <CategoryIcon
                  category={cat}
                  className="h-5 w-5 text-primary shrink-0"
                />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {categoryLabel[cat]}
                  </div>
                  <div className="text-lg font-semibold">{counts[cat]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Machines Table */}
        <Card data-testid="card-machines-list">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle data-testid="text-list-title">
                Lista de Dispositivos SEDCON
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  data-testid="button-export-excel"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  data-testid="button-add-machine"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Dispositivo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, MAC, série ou colaborador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as FilterStatus)}
                >
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid="select-filter"
                  >
                    <SelectValue placeholder="Filtrar equipamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" data-testid="select-item-all">
                      Todas
                    </SelectItem>
                    <SelectItem
                      value="assigned"
                      data-testid="select-item-assigned"
                    >
                      Atribuídas
                    </SelectItem>
                    <SelectItem
                      value="unassigned"
                      data-testid="select-item-unassigned"
                    >
                      Sem atribuição
                    </SelectItem>
                    <SelectItem
                      value="computador"
                      data-testid="select-item-computador"
                    >
                      Computadores
                    </SelectItem>
                    <SelectItem
                      value="telefone"
                      data-testid="select-item-telefone"
                    >
                      Telefones
                    </SelectItem>
                    <SelectItem value="switch" data-testid="select-item-switch">
                      Switches
                    </SelectItem>
                    <SelectItem
                      value="impressora"
                      data-testid="select-item-impressora"
                    >
                      Impressoras
                    </SelectItem>
                    <SelectItem
                      value="palo_alto"
                      data-testid="select-item-palo-alto"
                    >
                      Palo Alto
                    </SelectItem>
                    <SelectItem
                      value="quebradas"
                      data-testid="select-item-quebradas"
                    >
                      Quebradas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredMachines.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-testid="empty-state"
              >
                <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
                <h3
                  className="text-lg font-medium mb-2"
                  data-testid="text-empty-title"
                >
                  Nenhum dispositivo encontrado
                </h3>
                <p
                  className="text-muted-foreground mb-4"
                  data-testid="text-empty-description"
                >
                  {searchQuery || filterStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece adicionando um novo dispositivo"}
                </p>
                {!searchQuery && filterStatus === "all" && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    variant="outline"
                    data-testid="button-add-empty"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Dispositivo
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table data-testid="table-machines">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">
                        Nome do Dispositivo
                      </TableHead>
                      <TableHead className="font-semibold">Categoria</TableHead>
                      <TableHead className="font-semibold">
                        Identificador
                      </TableHead>
                      <TableHead className="font-semibold">
                        Colaborador
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMachines.map((machine) => (
                      <TableRow
                        key={machine.id}
                        className="hover-elevate"
                        data-testid={`row-machine-${machine.id}`}
                      >
                        <TableCell
                          className="font-medium"
                          data-testid={`text-machine-id-${machine.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <CategoryIcon
                              category={machine.category || "computador"}
                              className="h-4 w-4 text-muted-foreground shrink-0"
                            />
                            {machine.machineId}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-category-${machine.id}`}>
                          <span className="text-sm text-muted-foreground">
                            {
                              categoryLabel[
                                (machine.category as MachineCategory) ||
                                  "computador"
                              ]
                            }
                          </span>
                        </TableCell>
                        <TableCell
                          className="font-mono text-sm text-muted-foreground"
                          data-testid={`text-identifier-${machine.id}`}
                        >
                          {machine.category === "switch" ? (
                            <span className="italic text-muted-foreground/60">
                              —
                            </span>
                          ) : machine.category === "impressora" ? (
                            machine.serialNumber || (
                              <span className="italic text-muted-foreground/60">
                                —
                              </span>
                            )
                          ) : machine.category === "telefone" ? (
                            machine.macAddress ||
                            machine.serialNumber || (
                              <span className="italic text-muted-foreground/60">
                                —
                              </span>
                            )
                          ) : (
                            machine.macAddress || (
                              <span className="italic text-muted-foreground/60">
                                —
                              </span>
                            )
                          )}
                        </TableCell>
                        <TableCell
                          data-testid={`cell-collaborator-${machine.id}`}
                        >
                          {editingCollaborator?.id === machine.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingCollaborator.value}
                                onChange={(e) =>
                                  setEditingCollaborator({
                                    ...editingCollaborator,
                                    value: e.target.value,
                                  })
                                }
                                onKeyDown={handleInlineKeyDown}
                                onBlur={handleInlineSave}
                                className="h-8 w-40"
                                placeholder="Nome do colaborador"
                                autoFocus
                                data-testid={`input-collaborator-${machine.id}`}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleInlineSave}
                                disabled={updateMutation.isPending}
                                data-testid={`button-save-collaborator-${machine.id}`}
                              >
                                {updateMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleInlineCancel();
                                }}
                                data-testid={`button-cancel-collaborator-${machine.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleInlineEdit(machine)}
                              data-testid={`clickable-collaborator-${machine.id}`}
                            >
                              {machine.collaborator || (
                                <span className="text-muted-foreground italic">
                                  Clique para atribuir
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell data-testid={`cell-status-${machine.id}`}>
                          <div className="flex flex-wrap gap-1">
                            {machine.broken && (
                              <Badge
                                variant="destructive"
                                className="text-xs"
                                data-testid={`badge-broken-${machine.id}`}
                              >
                                Quebrada
                              </Badge>
                            )}
                            {machine.collaborator ? (
                              <Badge
                                variant="default"
                                className="bg-primary/10 text-primary border-0 text-xs"
                                data-testid={`badge-assigned-${machine.id}`}
                              >
                                Atribuída
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                data-testid={`badge-unassigned-${machine.id}`}
                              >
                                Sem atribuição
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(machine)}
                              data-testid={`button-edit-${machine.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedMachine(machine);
                                setIsDeleteDialogOpen(true);
                              }}
                              data-testid={`button-delete-${machine.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-add-machine">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-add-title">
              Novo Dispositivo
            </DialogTitle>
            <DialogDescription data-testid="text-dialog-add-description">
              Preencha os dados para cadastrar um novo dispositivo
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(onAddSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={addForm.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Dispositivo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: SEDCON-00000"
                        {...field}
                        data-testid="input-new-machine-id"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-new-category">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="computador">Computador</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="switch">Switch</SelectItem>
                        <SelectItem value="impressora">Impressora</SelectItem>
                        <SelectItem value="palo_alto">Palo Alto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DynamicFormFields
                form={addForm}
                watchCategory={watchAddCategory as MachineCategory}
              />
              <FormField
                control={addForm.control}
                name="collaborator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do colaborador"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-new-collaborator"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="broken"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-new-broken"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Equipamento quebrado
                    </FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    addForm.reset(defaultFormValues);
                  }}
                  data-testid="button-cancel-add"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-confirm-add"
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-testid="dialog-edit-machine"
        >
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-edit-title">
              Editar Dispositivo
            </DialogTitle>
            <DialogDescription data-testid="text-dialog-edit-description">
              Altere os dados do dispositivo selecionado
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={editForm.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Dispositivo</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-machine-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-category">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="computador">Computador</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="switch">Switch</SelectItem>
                        <SelectItem value="impressora">Impressora</SelectItem>
                        <SelectItem value="palo_alto">Palo Alto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DynamicFormFields
                form={editForm}
                watchCategory={watchEditCategory as MachineCategory}
              />
              <FormField
                control={editForm.control}
                name="collaborator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do colaborador"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-collaborator"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="broken"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-edit-broken"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Equipamento quebrado
                    </FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    editForm.reset(defaultFormValues);
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-confirm-edit"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent data-testid="dialog-delete-machine">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-dialog-delete-title">
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription data-testid="text-dialog-delete-description">
              Tem certeza que deseja excluir o dispositivo{" "}
              <strong>{selectedMachine?.machineId}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedMachine) {
                  deleteMutation.mutate(selectedMachine.id);
                }
              }}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
