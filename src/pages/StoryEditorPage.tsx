import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { PageLoader } from "@/shared/components/ui/page-loader";
import { storyService } from "@/services/storyService";
import { IStory } from "@/types/models/Story";
import { CertificationLevel } from "@/types/business";
import { storyGenres, StoryGenre } from "@/types/business/storyGenres";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ImageUploaderCard } from "@/shared/components/ui/ImageUploaderCard";

const LEVELS: CertificationLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function StoryEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<StoryGenre>("mystery");
  const [level, setLevel] = useState<CertificationLevel>("A1");
  const [img, setImg] = useState("");

  useEffect(() => {
    if (isEdit) loadStory();
  }, [id]);

  const loadStory = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const story = await storyService.getStoryById(id);
      setTitle(story.title);
      setDescription(story.description);
      setGenre(story.genre);
      setLevel(story.languageLevel);
      setImg(story.img || "");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al cargar la historia");
      navigate("/stories");
    } finally {
      setLoading(false);
    }
  };

  const handleAIFill = async () => {
    setFilling(true);
    try {
      const seed = [title.trim(), description.trim()].filter(Boolean).join(". ") || undefined;
      const idea = await storyService.generateStoryIdea(seed, genre, level);
      setTitle(idea.title);
      setDescription(idea.description);
      toast.success(seed ? "Título y descripción expandidos" : "Idea de historia generada");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error al generar la idea");
    } finally {
      setFilling(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    if (!description.trim()) {
      toast.error("La descripción es obligatoria");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        genre,
        languageLevel: level,
        img,
      };

      if (isEdit && id) {
        await storyService.updateStory(id, data);
        toast.success("Historia actualizada");
        navigate(`/stories/${id}`);
      } else {
        const story = await storyService.createStory(data);
        toast.success("Historia creada");
        navigate(`/stories/${story._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al guardar la historia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="">
      <PageHeader
        title={isEdit ? "Editar historia" : "Crear historia"}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(isEdit ? `/stories/${id}` : "/stories")} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </>
        }
      />

      <PageLoader
        loading={loading}
        onRetry={loadStory}
        onBack={() => navigate("/stories")}
      >
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Título</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAIFill} disabled={filling}>
                  {filling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {filling
                    ? "Generando..."
                    : title.trim() || description.trim()
                    ? "Completar con IA"
                    : "IA: idea al azar"}
                </Button>
              </div>
              <Input
                placeholder="Ingresá el título de la historia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Descripción</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Breve descripción de la historia"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
            </div>

            {/* Genre and Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Género</Label>
                <Select value={genre} onValueChange={(v) => setGenre(v as StoryGenre)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {storyGenres.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nivel</Label>
                <Select value={level} onValueChange={(v) => setLevel(v as CertificationLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cover image — only once the story exists (edit mode) */}
            {isEdit && id && (
              <ImageUploaderCard
                title="Imagen de portada"
                description="Genera una portada con IA basada en el título y la descripción, o pega una URL."
                imageUrl={img}
                onImageChange={setImg}
                word={[title.trim(), description.trim()].filter(Boolean).join(". ")}
                entityId={id}
                entityType="story"
              />
            )}

            {/* Save button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => navigate(isEdit ? `/stories/${id}` : "/stories")}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {isEdit ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLoader>
    </div>
  );
}
