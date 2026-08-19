import { ILecture } from "@/types/models/Lecture";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Edit, Trash2, Image as ImageIcon, BookOpen, Clock, Volume2 } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { deliveryImageUrl, getDifficultyVariant } from "@/utils/common";
import { getMarkdownTitle, stripMarkdown, removeFirstH1 } from "@/utils/common/string/markdown";
import { useNavigate } from "react-router-dom";

interface LecturesTableProps {
  lectures: ILecture[];
  loading: boolean;
  onEdit: (lecture: ILecture) => void;
  onDelete: (lecture: ILecture) => void;
  searchTerm?: string;
}

export function LecturesTable({ 
  lectures, 
  loading, 
  onEdit, 
  onDelete,
  searchTerm
}: LecturesTableProps) {
  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (lectures.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? `No se encontró la lectura "${searchTerm}"` : "No lectures found"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm 
                ? "Try adjusting your search" 
                : "Try adjusting your search or filters"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper to truncate content and strip markdown
  const truncateContent = (content: string, maxLength: number = 150) => {
    // First remove the H1 title (before stripping markdown)
    const withoutTitle = removeFirstH1(content);
    // Then strip markdown to get plain text
    const plainText = stripMarkdown(withoutTitle);
    // Clean up extra whitespace
    const cleaned = plainText.replace(/\n{2,}/g, '\n').trim();
    // Truncate
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4 overflow-x-hidden max-w-full pt-2">
      {lectures.map((lecture) => {
        const lectureTitle = getMarkdownTitle(lecture.content) || lecture.typeWrite || "Sin título";
        
        return (
        <Card key={lecture._id} className="hover:shadow-md transition-shadow overflow-hidden max-w-full">
          <CardContent className="p-2 sm:p-4 max-w-full">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start max-w-full">
              {/* Image */}
              <div className="flex-shrink-0 cursor-pointer w-full sm:w-auto flex justify-center sm:justify-start" onClick={() => navigate(`/lectures/${lecture._id}`)}>
                {lecture.img ? (
                  <img
                    src={deliveryImageUrl(lecture.img)}
                    alt="Lecture"
                    className="h-32 w-32 sm:h-20 sm:w-20 md:h-28 md:w-28 object-contain rounded max-w-full"
                  />
                ) : (
                  <div className="h-32 w-32 sm:h-20 sm:w-20 md:h-28 md:w-28 bg-muted rounded flex items-center justify-center max-w-full">
                    <ImageIcon className="h-12 w-12 sm:h-8 sm:w-8 md:h-12 md:w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 w-full sm:w-auto max-w-full overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2 max-w-full">
                  {/* Lecture Info */}
                  <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-1">
                      <h3 
                        className="font-bold text-lg sm:text-xl md:text-2xl cursor-pointer hover:text-primary transition-colors break-words max-w-full overflow-wrap-anywhere"
                        onClick={() => navigate(`/lectures/${lecture._id}`)}
                      >
                        {lectureTitle}
                      </h3>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 items-center mb-2">
                      <Badge variant={getDifficultyVariant(lecture.difficulty)} className="text-xs">
                        {lecture.difficulty || "N/A"}
                      </Badge>
                      {lecture.time && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lecture.time} min
                        </Badge>
                      )}
                      {lecture.urlAudio && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          Audio
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                    {lecture.typeWrite && (
                      <Badge variant="outline" className="text-xs">
                        {lecture.typeWrite}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                {lecture.content && (
                  <p className="text-xs sm:text-sm mb-2 break-words overflow-wrap-anywhere max-w-full text-muted-foreground">
                    {truncateContent(lecture.content)}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-row flex-wrap gap-1 sm:gap-2 mt-2">
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => navigate(`/lectures/${lecture._id}`)}
                    className="rounded-none"
                    title="Leer"
                  >
                    <BookOpen />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(lecture)}
                    className="rounded-none"
                    title="Editar"
                  >
                    <Edit />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(lecture)}
                    className="rounded-none"
                    title="Eliminar"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
