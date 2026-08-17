import { useState, useEffect } from "react";
import { ModalNova } from "../ui/modal-nova";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Loader2, BookOpen, FileText, Image, Clock, Volume2 } from "lucide-react";
import { ILecture } from "@/types/models/Lecture";
import { CertificationLevel, Language, ReadingType } from "@/types/business";
import { certificationLevelsJson, languagesJson, readingTypesJson } from "@/data/business/shared";
import { lectureService } from "@/services/lectureService";
import { QuillEditor } from "../ui/quill-editor";
import { ImageUploaderCard } from "../ui/ImageUploaderCard";
import { getMarkdownTitle } from "@/utils/common/string/markdown";

// Helper functions to convert between Markdown and HTML
const markdownToHtml = (markdown: string): string => {
  if (!markdown) return "";
  // Check if already HTML
  if (markdown.trim().startsWith("<")) return markdown;
  
  // Simple Markdown to HTML conversion
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|li|ul|ol|p])(.*$)/gim, '<p>$1</p>')
    .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<p><\/p>/g, '');
};

const htmlToMarkdown = (html: string): string => {
  if (!html) return "";
  // Check if already Markdown (no HTML tags)
  if (!html.includes("<")) return html;

  let result = html
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a href="([^"]+)">(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<ul>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<p>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove orphan p tags from Quill output (e.g. </p><p>...</p> leaves </p>)
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<\/?p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  return result;
};

interface LectureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lecture: ILecture | null;
  onSave: (data: any) => Promise<boolean>;
}

export function LectureDialog({ open, onOpenChange, lecture, onSave }: LectureDialogProps) {
  const isEditMode = !!lecture;
  const [loading, setLoading] = useState(false);
  const [loadingLecture, setLoadingLecture] = useState(false);
  const [fullLecture, setFullLecture] = useState<ILecture | null>(null);

  const [formData, setFormData] = useState({
    content: "",
    difficulty: "" as CertificationLevel | "",
    language: "en" as Language,
    typeWrite: "" as ReadingType | "",
    time: 0,
    img: "",
    urlAudio: "",
  });

  // Load full lecture data when editing
  useEffect(() => {
    if (!open || !lecture?._id) {
      setFullLecture(null);
      return;
    }

    const loadFullLecture = async () => {
      setLoadingLecture(true);
      try {
        const data = await lectureService.getLectureById(lecture._id);
        setFullLecture(data);
      } catch (error) {
        console.error("Error loading lecture:", error);
        // Fallback to the lecture passed as prop
        setFullLecture(lecture);
      } finally {
        setLoadingLecture(false);
      }
    };

    loadFullLecture();
  }, [lecture?._id, open]);

  // Reset form when dialog opens with lecture data
  useEffect(() => {
    // SOLO actuar cuando el diálogo está abierto
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        content: "",
        difficulty: "",
        language: "en",
        typeWrite: "",
        time: 0,
        img: "",
        urlAudio: "",
      });
      setFullLecture(null);
      return;
    }
    
    // Use fullLecture if available, otherwise use lecture prop
    const lectureToUse = fullLecture || lecture;
    
    if (lectureToUse) {
      // Convert Markdown to HTML for Quill
      const contentHtml = markdownToHtml(lectureToUse.content || "");
      
      // Force update with lecture data
      const newFormData = {
        content: contentHtml,
        difficulty: (lectureToUse.difficulty as CertificationLevel) || "",
        language: (lectureToUse.language as Language) || "en",
        typeWrite: (lectureToUse.typeWrite as ReadingType) || "",
        time: lectureToUse.time || 0,
        img: lectureToUse.img || "",
        urlAudio: lectureToUse.urlAudio || "",
      };
      setFormData(newFormData);
    } else {
      // Reset for new lecture
      setFormData({
        content: "",
        difficulty: "",
        language: "en",
        typeWrite: "",
        time: 0,
        img: "",
        urlAudio: "",
      });
    }
  }, [fullLecture, lecture, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert HTML from Quill back to Markdown
      const contentMarkdown = htmlToMarkdown(formData.content);
      
      const lectureData: any = {
        content: contentMarkdown,
        language: formData.language,
        difficulty: formData.difficulty || undefined,
        typeWrite: formData.typeWrite || undefined,
        time: formData.time || undefined,
        img: formData.img || undefined,
        urlAudio: formData.urlAudio || undefined,
      };

      const success = await onSave(lectureData);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalNova
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Editar Lectura" : "Crear Lectura"}
      description={
        isEditMode
          ? "Modifica los datos de la lectura"
          : "Completa la información para crear una nueva lectura"
      }
      size="4xl"
      height="h-[90dvh]"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} onClick={handleSubmit}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEditMode ? "Actualizar Lectura" : "Crear Lectura"}
          </Button>
        </>
      }
    >
      <div className="px-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="sticky top-0 z-10 grid w-full grid-cols-3 shadow-md">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Contenido</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span>Media</span>
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-4">
              {/* Language, Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma *</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: Language) => setFormData({ ...formData, language: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languagesJson.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Nivel de Certificación</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: CertificationLevel) => setFormData({ ...formData, difficulty: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificationLevelsJson.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* TypeWrite, Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeWrite">Tipo de Escritura</Label>
                  <Select
                    value={formData.typeWrite}
                    onValueChange={(value: ReadingType) => setFormData({ ...formData, typeWrite: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de escritura" />
                    </SelectTrigger>
                    <SelectContent>
                      {readingTypesJson.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Tiempo (minutos)</Label>
                  <Input
                    id="time"
                    type="number"
                    min="0"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: parseInt(e.target.value) || 0 })}
                    disabled={loading}
                    placeholder="0"
                    autoComplete="off"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="content">Contenido *</Label>
                <QuillEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Escribe el contenido de la lectura aquí. Usa el primer H1 como título principal."
                  disabled={loading || loadingLecture}
                  height="500px"
                  className="min-h-[500px]"
                />
                <p className="text-xs text-muted-foreground">
                  Usa el editor para formatear el contenido. El primer H1 será usado como título principal.
                </p>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="mt-4">
              <ImageUploaderCard
                title="Imagen de la Lectura"
                description={
                  isEditMode 
                    ? "Sube una nueva imagen, genera con IA, o usa una URL"
                    : "Ingresa una URL de imagen. Podrás subir una imagen después de crear la lectura."
                }
                imageUrl={formData.img || ""}
                onImageChange={(url) => setFormData({ ...formData, img: url })}
                entityId={lecture?._id}
                entityType="lecture"
                word={getMarkdownTitle(formData.content) || ""}
                disabled={loading || loadingLecture}
                className="mt-0"
              />

              <div className="space-y-2 mt-4">
                <Label htmlFor="urlAudio">URL de Audio</Label>
                <Input
                  id="urlAudio"
                  type="url"
                  value={formData.urlAudio}
                  onChange={(e) => setFormData({ ...formData, urlAudio: e.target.value })}
                  disabled={loading}
                  placeholder="https://..."
                  autoComplete="off"
                />
                {formData.urlAudio && (
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={formData.urlAudio} type="audio/mpeg" />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </ModalNova>
  );
}
