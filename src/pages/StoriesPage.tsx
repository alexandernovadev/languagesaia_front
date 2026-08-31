import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageLoader } from "@/shared/components/ui/page-loader";
import { TablePagination } from "@/shared/components/ui/table-pagination";
import { storyService } from "@/services/storyService";
import { IStory } from "@/types/models/Story";
import { CertificationLevel } from "@/types/business";
import { storyGenres, StoryGenre } from "@/types/business/storyGenres";
import { BookOpen, Plus, Search, X, Filter, BookOpenText } from "lucide-react";
import { deliveryImageUrl, getDifficultyVariant } from "@/utils/common";
import { cn } from "@/utils/common/classnames";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { ModalNova } from "@/shared/components/ui/modal-nova";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "sonner";

const LEVELS: CertificationLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function StoriesPage() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const [stories, setStories] = useState<IStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadStories();
  }, [page, selectedGenre, selectedLevels]);

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, any> = {};
      if (selectedGenre) filters.genre = selectedGenre;
      if (selectedLevels.length > 0) filters.level = selectedLevels;
      if (search.trim()) filters.search = search.trim();

      const res = await storyService.getStories(page, 12, search, filters);
      setStories(res.data || []);
      setTotalPages(res.pages || 1);
      setTotal(res.total || 0);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al cargar las historias";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStories();
  }, [search]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSelectedGenre("");
    setSelectedLevels([]);
    setPage(1);
  }, []);

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const activeFiltersCount = (selectedGenre ? 1 : 0) + selectedLevels.length;

  return (
    <div className="">
      <PageHeader
        title="Historias"
        actions={
          <Button onClick={() => navigate("/stories/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Crear historia
          </Button>
        }
        filters={
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar historias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
            <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full size-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        }
      />

      {/* Filter modal */}
      <ModalNova
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filtros"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setFilterOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setPage(1); loadStories(); setFilterOpen(false); }}>Aplicar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Género</Label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger><SelectValue placeholder="Todos los géneros" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los géneros</SelectItem>
                {storyGenres.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nivel</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {LEVELS.map((level) => (
                <Badge
                  key={level}
                  variant={selectedLevels.includes(level) ? "default" : "outline"}
                  className={cn("cursor-pointer", selectedLevels.includes(level) && "bg-primary text-primary-foreground")}
                  onClick={() => toggleLevel(level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ModalNova>

      <PageLoader
        loading={loading}
        error={error}
        onRetry={loadStories}
        onBack={() => navigate("/")}
      >
        {stories.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpenText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Todavía no hay historias</h3>
            <p className="text-muted-foreground mb-4">Creá tu primera historia para empezar</p>
            <Button onClick={() => navigate("/stories/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Crear historia
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stories.map((story) => (
                <StoryCard key={story._id} story={story} onClick={() => navigate(`/stories/${story._id}`)} />
              ))}
            </div>

          </>
        )}
      </PageLoader>

      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
        itemsCount={stories.length}
        itemLabel="historias"
        pageSize={12}
        onPageChange={setPage}
      />
    </div>
  );
}

function StoryCard({ story, onClick }: { story: IStory; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-muted">
          {story.img ? (
            <img
              src={deliveryImageUrl(story.img)}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base truncate mb-1">{story.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{story.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getDifficultyVariant(story.languageLevel)}>{story.languageLevel}</Badge>
            <Badge variant="secondary">{story.genre}</Badge>
            <Badge variant="outline" className="ml-auto">
              {story.chapters.length} {story.chapters.length === 1 ? "capítulo" : "capítulos"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
