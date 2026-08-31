import { useCallback, lazy, Suspense } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ExpressionsTable } from "@/shared/components/tables/ExpressionsTable";
import { ExpressionFiltersModal } from "@/shared/components/filters/ExpressionFiltersModal";

const ExpressionDialog = lazy(() =>
  import("@/shared/components/dialogs/ExpressionDialog").then((m) => ({ default: m.ExpressionDialog }))
);
import { useExpressions } from "@/shared/hooks/useExpressions";
import { IExpression } from "@/types/models/Expression";
import { Plus, Search, Filter, X, Sparkles } from "lucide-react";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";
import { expressionService } from "@/services/expressionService";
import { AddExpressionQuickDialog } from "@/shared/components/dialogs/AddExpressionQuickDialog";
import { useUserStore } from "@/lib/store/user-store";
import { useExpressionsUIStore } from "@/lib/store/expressions-store";
import { TablePagination } from "@/shared/components/ui/table-pagination";
import { toast } from "sonner";

export default function ExpressionsPage() {
  const {
    expressions,
    loading,
    currentPage,
    totalPages,
    total,
    createExpression,
    updateExpression,
    deleteExpression,
    updateFilters,
    clearFilters,
    goToPage,
    filters,
    refreshExpressions,
  } = useExpressions();

  const {
    dialogOpen, setDialogOpen,
    filtersModalOpen, setFiltersModalOpen,
    selectedItem: selectedExpression, setSelectedItem: setSelectedExpression,
    deleteDialogOpen, setDeleteDialogOpen,
    itemToDelete: expressionToDelete, setItemToDelete: setExpressionToDelete,
    searchTerm, setSearchTerm,
    deleteLoading, setDeleteLoading,
    isGenerating, setIsGenerating,
    quickAddOpen, setQuickAddOpen,
  } = useExpressionsUIStore();

  const { user } = useUserStore();

  const handleCreate = useCallback(() => {
    setSelectedExpression(null);
    setDialogOpen(true);
  }, [setSelectedExpression, setDialogOpen]);

  const handleEdit = useCallback((expression: IExpression) => {
    setSelectedExpression(expression);
    setDialogOpen(true);
  }, [setSelectedExpression, setDialogOpen]);

  const handleDeleteClick = useCallback((expression: IExpression) => {
    setExpressionToDelete(expression);
    setDeleteDialogOpen(true);
  }, [setExpressionToDelete, setDeleteDialogOpen]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!expressionToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteExpression(expressionToDelete._id);
      setDeleteDialogOpen(false);
      setExpressionToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }, [expressionToDelete, deleteExpression, setDeleteLoading, setDeleteDialogOpen, setExpressionToDelete]);

  const handleSave = useCallback(async (expressionData: any) => {
    if (selectedExpression) {
      return await updateExpression(selectedExpression._id, expressionData);
    }
    return await createExpression(expressionData);
  }, [selectedExpression, updateExpression, createExpression]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    updateFilters({ search: q || undefined });
  }, [searchTerm, updateFilters]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    clearFilters();
  }, [setSearchTerm, clearFilters]);

  const handleGenerateWithAI = useCallback(async (expressionPrompt: string) => {
    setIsGenerating(true);
    try {
      const language = user?.language || "en";
      const response = await expressionService.generateExpression(expressionPrompt, language);

      if (response.data.success && response.data.data) {
        const generatedData = response.data.data;
        const success = await createExpression({
          expression: generatedData.expression || expressionPrompt,
          definition: generatedData.definition || "",
          language: generatedData.language || "en",
          difficulty: generatedData.difficulty,
          type: generatedData.type || [],
          context: generatedData.context,
          examples: generatedData.examples || [],
          img: generatedData.img,
          spanish: generatedData.spanish,
        });

        if (success) {
          toast.success(`Expresión "${expressionPrompt}" generada exitosamente`);
          await refreshExpressions();
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error generando expresión con AI";
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  }, [user, createExpression, refreshExpressions, setIsGenerating]);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== "page" && key !== "limit" && value !== undefined && value !== ""
  ).length;

  return (
    <div className="">
      <PageHeader
        title="Expresiones"
        filters={
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar expresión..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeFiltersCount > 0 && (
                <Button type="button" variant="ghost" onClick={handleClearFilters} size="icon" title="Limpiar filtros">
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button type="submit" variant="secondary" size="icon" title="Buscar">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFiltersModalOpen(true)}
              title="Filtros"
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQuickAddOpen(true)}
              title="Agregar expresión rápida (IA)"
            >
              <Sparkles className="h-4 w-4" />
            </Button>

            <Button type="button" variant="default" onClick={handleCreate} size="icon" title="Crear expresión">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <AddExpressionQuickDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onAdd={handleGenerateWithAI}
        language={user?.language || "en"}
      />

      <ExpressionsTable
        expressions={expressions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        searchTerm={filters.search || searchTerm}
        onGenerateWithAI={handleGenerateWithAI}
        isGenerating={isGenerating}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        itemsCount={expressions.length}
        itemLabel="expresiones"
        onPageChange={goToPage}
      />

      {dialogOpen && (
        <Suspense fallback={null}>
          <ExpressionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            expression={selectedExpression}
            onSave={handleSave}
          />
        </Suspense>
      )}

      <AlertDialogNova
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar expresión?"
        description={
          <>
            Esto eliminará permanentemente la expresión <strong>{expressionToDelete?.expression}</strong>.
            Esta acción no se puede deshacer.
          </>
        }
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        confirmClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      />

      <ExpressionFiltersModal
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        filters={filters}
        onApplyFilters={updateFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
