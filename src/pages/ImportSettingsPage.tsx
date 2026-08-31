import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ImportTab } from "@/shared/components/import/ImportTab";

export default function ImportSettingsPage() {
  return (
    <div className="">
      <PageHeader 
        title="Importar Datos" 
      />
      
      <Tabs defaultValue="words" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="words">Words</TabsTrigger>
          <TabsTrigger value="expressions">Expressions</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="words" className="mt-4">
          <ImportTab
            type="words"
            title="Importar Palabras"
          />
        </TabsContent>

        <TabsContent value="expressions" className="mt-4">
          <ImportTab
            type="expressions"
            title="Importar Expresiones"
          />
        </TabsContent>

        <TabsContent value="exams" className="mt-4">
          <ImportTab
            type="exams"
            title="Importar Exámenes"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
