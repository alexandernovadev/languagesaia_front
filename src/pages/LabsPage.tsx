import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";
import { DangerZoneItem } from "@/shared/components/ui/danger-zone-item";
import { useDangerousOperation } from "@/shared/hooks/useDangerousOperation";
import { toast } from "sonner";
import { labsService } from "@/services/labsService";
import { UserPlus, Mail, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

export default function LabsPage() {
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isSendingBackup, setIsSendingBackup] = useState(false);
  const [isMigratingSynonyms, setIsMigratingSynonyms] = useState(false);
  const [isMigratingWordIndex, setIsMigratingWordIndex] = useState(false);

  const {
    pendingOperation,
    showFirstConfirm,
    showSecondConfirm,
    operationLoading,
    operationLabel,
    trigger,
    handleFirstConfirm,
    handleSecondConfirm,
    handleCancel,
    handleFirstOpenChange,
    handleSecondOpenChange,
  } = useDangerousOperation({
    words: async () => {
      const response = await labsService.deleteAllWords();
      if (response.success) {
        const { deletedCount, timestamp } = response.data;
        toast.success(`✅ ${deletedCount} palabras eliminadas exitosamente`);
        toast.info(`Eliminado a las: ${new Date(timestamp).toLocaleString()}`, { duration: 5000 });
      } else {
        toast.error(response.message || "Failed to delete words");
      }
    },
    expressions: async () => {
      const response = await labsService.deleteAllExpressions();
      if (response.success) {
        const { deletedCount, timestamp } = response.data;
        toast.success(`✅ ${deletedCount} expresiones eliminadas exitosamente`);
        toast.info(`Eliminado a las: ${new Date(timestamp).toLocaleString()}`, { duration: 5000 });
      } else {
        toast.error(response.message || "Failed to delete expressions");
      }
    },
    lectures: async () => {
      const response = await labsService.deleteAllLectures();
      if (response.success) {
        const { deletedCount, timestamp } = response.data;
        toast.success(`✅ ${deletedCount} lecturas eliminadas exitosamente`);
        toast.info(`Eliminado a las: ${new Date(timestamp).toLocaleString()}`, { duration: 5000 });
      } else {
        toast.error(response.message || "Failed to delete lectures");
      }
    },
    exams: async () => {
      const response = await labsService.deleteAllExams();
      if (response.success) {
        const { deletedCount, deletedAttempts, timestamp } = response.data;
        toast.success(`✅ ${deletedCount} exámenes eliminados exitosamente`);
        toast.info(`${deletedAttempts} intentos eliminados · ${new Date(timestamp).toLocaleString()}`, { duration: 5000 });
      } else {
        toast.error(response.message || "Failed to delete exams");
      }
    },
    stories: async () => {
      const response = await labsService.deleteAllStories();
      if (response.success) {
        const { deletedCount, timestamp } = response.data;
        toast.success(`✅ ${deletedCount} historias eliminadas exitosamente`);
        toast.info(`Eliminado a las: ${new Date(timestamp).toLocaleString()}`, { duration: 5000 });
      } else {
        toast.error(response.message || "Failed to delete stories");
      }
    },
  });

  const handleCreateAdmin = async () => {
    setIsCreatingAdmin(true);
    try {
      const response = await labsService.createAdminUser();
      if (response.success) {
        toast.success(response.message || "Admin user created successfully");
      } else {
        toast.error(response.message || "Failed to create admin user");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating admin user");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleSendBackup = async () => {
    setIsSendingBackup(true);
    try {
      const response = await labsService.sendBackupByEmail();
      if (response.success) {
        toast.success(response.message || "Backup sent successfully");
        if (response.data) {
          const { wordsCount, lecturesCount, expressionsCount } = response.data;
          toast.info(`Backup includes: ${wordsCount || 0} words, ${lecturesCount || 0} lectures, ${expressionsCount || 0} expressions`, { duration: 5000 });
        }
      } else {
        toast.error(response.message || "Failed to send backup");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error sending backup");
    } finally {
      setIsSendingBackup(false);
    }
  };

  const handleMigrateSynonyms = async () => {
    setIsMigratingSynonyms(true);
    try {
      const response = await labsService.migrateSinonymsToSynonyms();
      if (response.success) {
        toast.success(`Migration complete — ${response.data?.modifiedCount ?? 0} documents updated`);
      } else {
        toast.error(response.message || "Migration failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error running migration");
    } finally {
      setIsMigratingSynonyms(false);
    }
  };

  const handleMigrateWordIndex = async () => {
    setIsMigratingWordIndex(true);
    try {
      const response = await labsService.migrateWordUniqueIndex();
      if (response.success) {
        toast.success(`Migration complete — ${response.data?.backfilled ?? 0} words backfilled`);
      } else {
        toast.error(response.message || "Migration failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error running migration");
    } finally {
      setIsMigratingWordIndex(false);
    }
  };

  return (
    <div className="">
      <PageHeader title="Labs" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create Admin User
            </CardTitle>
            <CardDescription>
              Create a new administrator user for development and testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateAdmin} disabled={isCreatingAdmin} className="w-full" size="lg">
              {isCreatingAdmin ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Admin User"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Backup by Email
            </CardTitle>
            <CardDescription>
              Send a complete system backup via email with detailed statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSendBackup} disabled={isSendingBackup} variant="secondary" className="w-full" size="lg">
              {isSendingBackup ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send Backup"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Information</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Admin user creation is for development purposes only</li>
            <li>Backup emails include all words, lectures, and expressions</li>
            <li>These operations may take a few moments to complete</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Migrations
          </CardTitle>
          <CardDescription>One-time database migrations. Safe to run multiple times.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base sm:text-lg">Rename sinonyms → synonyms</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                Renombra el campo <code>sinonyms</code> a <code>synonyms</code> en todos los documentos de Words. Idempotente.
              </p>
            </div>
            <Button onClick={handleMigrateSynonyms} disabled={isMigratingSynonyms} variant="secondary" className="w-full sm:w-auto flex-shrink-0" size="sm">
              {isMigratingSynonyms ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</> : <><RefreshCw className="mr-2 h-4 w-4" /> Run Migration</>}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg mt-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base sm:text-lg">Word unique index (word + language)</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                Backfillea <code>wordKey</code>, droppea el índice único <code>word_1</code> y crea el índice compuesto <code>wordKey + language</code> (case-insensitive).
              </p>
            </div>
            <Button onClick={handleMigrateWordIndex} disabled={isMigratingWordIndex} variant="secondary" className="w-full sm:w-auto flex-shrink-0" size="sm">
              {isMigratingWordIndex ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</> : <><RefreshCw className="mr-2 h-4 w-4" /> Run Migration</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>⚠️ Operaciones IRREVERSIBLES que eliminarán datos permanentemente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DangerZoneItem
            title="Delete All Words"
            description="Elimina TODAS las palabras de la base de datos. No se puede deshacer."
            loading={operationLoading && pendingOperation === 'words'}
            onDelete={() => trigger('words')}
          />
          <DangerZoneItem
            title="Delete All Expressions"
            description="Elimina TODAS las expresiones de la base de datos. No se puede deshacer."
            loading={operationLoading && pendingOperation === 'expressions'}
            onDelete={() => trigger('expressions')}
          />
          <DangerZoneItem
            title="Delete All Lectures"
            description="Elimina TODAS las lecturas de la base de datos. No se puede deshacer."
            loading={operationLoading && pendingOperation === 'lectures'}
            onDelete={() => trigger('lectures')}
          />
          <DangerZoneItem
            title="Delete All Exams"
            description="Elimina TODOS los exámenes y sus intentos de la base de datos. No se puede deshacer."
            loading={operationLoading && pendingOperation === 'exams'}
            onDelete={() => trigger('exams')}
          />
          <DangerZoneItem
            title="Delete All Stories"
            description="Elimina TODAS las historias de la base de datos. No se puede deshacer."
            loading={operationLoading && pendingOperation === 'stories'}
            onDelete={() => trigger('stories')}
          />
        </CardContent>
      </Card>

      <AlertDialogNova
        open={showFirstConfirm}
        onOpenChange={handleFirstOpenChange}
        title="⚠️ ¿Estás ABSOLUTAMENTE SEGURO?"
        description={
          <>
            Esto eliminará <strong>TODAS las {operationLabel}</strong> de la base de datos.
            <br /><br />
            Esta es una operación <strong className="text-destructive">IRREVERSIBLE</strong>.
          </>
        }
        onConfirm={handleFirstConfirm}
        onCancel={handleCancel}
        confirmText="Sí, continuar"
        cancelText="Cancelar"
        confirmVariant="destructive"
      />

      <AlertDialogNova
        open={showSecondConfirm}
        onOpenChange={handleSecondOpenChange}
        title="⚠️ ÚLTIMA ADVERTENCIA"
        description={
          <>
            Esta acción <strong className="text-destructive">NO SE PUEDE DESHACER</strong>.
            <br /><br />
            Se eliminarán <strong>PERMANENTEMENTE</strong> todas las {operationLabel}.
            <br /><br />
            ¿Deseas continuar con la eliminación?
          </>
        }
        onConfirm={handleSecondConfirm}
        onCancel={handleCancel}
        confirmText="Sí, eliminar todo"
        cancelText="No, cancelar"
        loading={operationLoading}
        confirmVariant="destructive"
        shouldAutoCloseOnConfirm={false}
      />
    </div>
  );
}
