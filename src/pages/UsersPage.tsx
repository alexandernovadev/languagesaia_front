import { useCallback, lazy, Suspense } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { UsersTable } from "@/shared/components/tables/UsersTable";
import { TablePagination } from "@/shared/components/ui/table-pagination";

const UserDialog = lazy(() =>
  import("@/shared/components/dialogs/UserDialog").then((m) => ({ default: m.UserDialog }))
);
import { useUsers } from "@/shared/hooks/useUsers";
import { useUsersUIStore } from "@/lib/store/users-store";
import type { User } from "@/services/userService";
import { Plus, Search, X } from "lucide-react";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";

export default function UsersPage() {
  const {
    users,
    loading,
    currentPage,
    totalPages,
    total,
    createUser,
    updateUser,
    deleteUser,
    updateFilters,
    clearFilters,
    goToPage,
    filters,
  } = useUsers();

  const {
    dialogOpen, setDialogOpen,
    selectedItem: selectedUser, setSelectedItem: setSelectedUser,
    deleteDialogOpen, setDeleteDialogOpen,
    itemToDelete: userToDelete, setItemToDelete: setUserToDelete,
    searchTerm, setSearchTerm,
    deleteLoading, setDeleteLoading,
  } = useUsersUIStore();

  const handleCreate = useCallback(() => {
    setSelectedUser(null);
    setDialogOpen(true);
  }, [setSelectedUser, setDialogOpen]);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  }, [setSelectedUser, setDialogOpen]);

  const handleDeleteClick = useCallback((user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, [setUserToDelete, setDeleteDialogOpen]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteUser(userToDelete._id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }, [userToDelete, deleteUser, setDeleteLoading, setDeleteDialogOpen, setUserToDelete]);

  const handleSave = useCallback(async (userData: any) => {
    if (selectedUser) {
      return await updateUser(selectedUser._id, userData);
    }
    return await createUser(userData);
  }, [selectedUser, updateUser, createUser]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ username: searchTerm.trim() || undefined });
  }, [searchTerm, updateFilters]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    clearFilters();
  }, [setSearchTerm, clearFilters]);

  return (
    <div className="">
      <PageHeader
        title="Usuarios"
        filters={
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {(searchTerm || Object.keys(filters).length > 2) && (
              <Button type="button" variant="ghost" onClick={handleClearSearch} size="icon" title="Limpiar búsqueda">
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" variant="secondary" size="icon" title="Buscar">
              <Search className="h-4 w-4" />
            </Button>
            <Button type="button" variant="default" onClick={handleCreate} size="icon" title="Crear usuario">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        }
      />

      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        itemsCount={users.length}
        itemLabel="usuarios"
        onPageChange={goToPage}
      />

      {dialogOpen && (
        <Suspense fallback={null}>
          <UserDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            user={selectedUser}
            onSave={handleSave}
          />
        </Suspense>
      )}

      <AlertDialogNova
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar usuario?"
        description={
          <>
            Esto eliminará permanentemente al usuario <strong>{userToDelete?.username}</strong>.
            Esta acción no se puede deshacer.
          </>
        }
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        confirmClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      />
    </div>
  );
}
