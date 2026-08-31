import { useCallback, lazy, Suspense } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { WordsTable } from "@/shared/components/tables/WordsTable";
import { WordFiltersModal } from "@/shared/components/filters/WordFiltersModal";

const WordDialog = lazy(() =>
  import("@/shared/components/dialogs/WordDialog").then((m) => ({ default: m.WordDialog }))
);
const WordDetailModal = lazy(() =>
  import("@/shared/components/dialogs/WordDetailModal").then((m) => ({ default: m.WordDetailModal }))
);
import { useWords } from "@/shared/hooks/useWords";
import { IWord } from "@/types/models/Word";
import { Plus, Search, Filter, X, Sparkles } from "lucide-react";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";
import { AddWordQuickDialog } from "@/shared/components/dialogs/AddWordQuickDialog";
import { useUserStore } from "@/lib/store/user-store";
import { useWordsUIStore } from "@/lib/store/words-store";
import { wordService } from "@/services/wordService";
import { TablePagination } from "@/shared/components/ui/table-pagination";
import { toast } from "sonner";

export default function WordsPage() {
  const {
    words,
    loading,
    currentPage,
    totalPages,
    total,
    createWord,
    updateWord,
    deleteWord,
    updateFilters,
    clearFilters,
    goToPage,
    filters,
    refreshWords,
  } = useWords();

  // ✅ NEW: Use Words UI Store instead of useState
  const {
    dialogOpen,
    setDialogOpen,
    filtersModalOpen,
    setFiltersModalOpen,
    selectedItem: selectedWord,
    setSelectedItem: setSelectedWord,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete: wordToDelete,
    setItemToDelete: setWordToDelete,
    searchTerm,
    setSearchTerm,
    deleteLoading,
    setDeleteLoading,
    isGenerating,
    setIsGenerating,
    detailModalOpen,
    setDetailModalOpen,
    selectedWordId,
    setSelectedWordId,
    quickAddOpen,
    setQuickAddOpen,
  } = useWordsUIStore();

  const { user } = useUserStore();

  // Handle create
  const handleCreate = () => {
    setSelectedWord(null);
    setDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (word: IWord) => {
    setSelectedWord(word);
    setDialogOpen(true);
  };

  // Handle view detail
  const handleView = (word: IWord) => {
    setSelectedWordId(word._id);
    setDetailModalOpen(true);
  };

  // Handle word update from detail modal
  const handleWordUpdate = useCallback((updatedWord: IWord) => {
    // Refresh the words list
    refreshWords();
  }, [refreshWords]);

  // Handle delete click
  const handleDeleteClick = (word: IWord) => {
    setWordToDelete(word);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (wordToDelete) {
      setDeleteLoading(true);
      try {
        await deleteWord(wordToDelete._id);
        setDeleteDialogOpen(false);
        setWordToDelete(null);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Handle save (create or update)
  const handleSave = async (wordData: any) => {
    if (selectedWord) {
      return await updateWord(selectedWord._id, wordData);
    } else {
      return await createWord(wordData);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchTerm(q);
    updateFilters({ wordUser: q || undefined });
  };

  // Handle apply filters from modal
  const handleApplyFilters = (newFilters: any) => {
    updateFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    clearFilters();
  };

  // Handle generate with AI
  const handleGenerateWithAI = async (word: string) => {
    setIsGenerating(true);
    try {
      const response = await wordService.generateWord(word, user?.language || "en");

      if (response) {
        toast.success(`Palabra "${word}" generada exitosamente`);

        // Refrescar la lista - la palabra aparecerá automáticamente porque el filtro wordUser sigue activo
        await refreshWords();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Error generando palabra con AI';
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle quick add (from dialog)
  const handleQuickAdd = async (word: string) => {
    await handleGenerateWithAI(word);
  };

  // Count active filters (excluding page and limit)
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== "page" && key !== "limit" && value !== undefined && value !== ""
  ).length;

  return (
    <div className="">
      <PageHeader
        title="Palabras"
        filters={
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar palabra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearFilters}
                  size="icon"
                  title="Limpiar filtros"
                >
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
              title="Agregar palabra rápida (IA)"
            >
              <Sparkles className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="default"
              onClick={handleCreate}
              size="icon"
              title="Crear palabra"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <AddWordQuickDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onAdd={handleQuickAdd}
        language={user?.language || "en"}
      />

      {/* Words Table */}
      <WordsTable
        words={words}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
        searchTerm={filters.wordUser || searchTerm}
        onGenerateWithAI={handleGenerateWithAI}
        isGenerating={isGenerating}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        itemsCount={words.length}
        itemLabel="palabras"
        onPageChange={goToPage}
      />

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <Suspense fallback={null}>
          <WordDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            word={selectedWord}
            onSave={handleSave}
          />
        </Suspense>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialogNova
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar palabra?"
        description={
          <>
            Esto eliminará permanentemente la palabra <strong>{wordToDelete?.word}</strong>.
            Esta acción no se puede deshacer.
          </>
        }
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
      />

      {/* Filters Modal */}
      <WordFiltersModal
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Word Detail Modal */}
      {detailModalOpen && (
        <Suspense fallback={null}>
          <WordDetailModal
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            wordId={selectedWordId}
            onWordUpdate={handleWordUpdate}
          />
        </Suspense>
      )}
    </div>
  );
}
