import { useState, useRef, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Loader2, Wand2, Upload, X, Image } from "lucide-react";
import { toast } from "sonner";
import { axiosClient as api } from "@/services/api/HttpClient";
import { useResultHandler } from "@/shared/hooks/useResultHandler";
import useImageUpload from "@/shared/hooks/useImageUpload";
import { deliveryImageUrl } from "@/utils/common";
import "./ImageUploaderCard.css";

interface ImageUploaderCardProps {
  title?: string;
  description?: string;
  imageUrl: string;
  onImageChange: (url: string) => void;
  onGenerateImage?: (word: string, oldImage?: string) => Promise<string>;
  word?: string;
  entityId?: string;
  entityType?: "word" | "expression" | "story";
  disabled?: boolean;
  className?: string;
}

export function ImageUploaderCard({
  title = "Imagen",
  description = "Añade una imagen representativa (URL).",
  imageUrl,
  onImageChange,
  onGenerateImage,
  word = "",
  entityId,
  entityType = "word",
  disabled = false,
  className = "",
}: ImageUploaderCardProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragImageFile, setDragImageFile] = useState<File | null>(null);
  const [dragImagePreview, setDragImagePreview] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook for error handling
  const { handleApiResult } = useResultHandler();

  // Custom hook for image uploads
  const { isUploading, uploadImage } = useImageUpload({
    entityType,
    entityId: entityId || "",
    onImageChange
  });

  // Function to generate image with AI
  const handleGenerateImage = async () => {
    if (!word) {
      toast.error("Necesitas una palabra para generar una imagen");
      return;
    }

    if (onGenerateImage) {
      // Si se proporciona una función personalizada, usarla
      try {
        setIsGeneratingImage(true);
        const newImageUrl = await onGenerateImage(word, imageUrl);
        onImageChange(newImageUrl);
      } catch (error) {
        handleApiResult(error, "Generar Imagen");
      } finally {
        setIsGeneratingImage(false);
      }
      return;
    }

    // Función por defecto usando la API
    if (!entityId) {
      toast.error("ID de entidad requerido para generar imagen");
      return;
    }

    setIsGeneratingImage(true);

    try {
      // Determinar el endpoint según el tipo de entidad
      let endpoint = `/api/words/${entityId}/generate-image`;
      let payload: any = { word, imgOld: imageUrl || "" };

      if (entityType === "expression") {
        endpoint = `/api/expressions/${entityId}/generate-image`;
        payload = { expressionString: word, imgOld: imageUrl || "" };
      } else if (entityType === "story") {
        endpoint = `/api/stories/${entityId}/generate-image`;
        payload = { content: word, imgOld: imageUrl || "" };
      }

      // Llamar al endpoint de generación de imagen
      const response = await api.post(endpoint, payload);

      if (response.data.success && response.data.data) {
        const newImageUrl = response.data.data.img;
        if (newImageUrl) {
          onImageChange(newImageUrl);
          toast.success("Imagen generada exitosamente");
        } else {
          throw new Error("La imagen se generó pero no se recibió la URL");
        }
      } else {
        throw new Error(response.data.error || "Error al generar imagen");
      }
    } catch (error: any) {
      handleApiResult(error, "Generar Imagen");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Functions for drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      setDragImageFile(imageFile);
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setDragImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      toast.error("Solo se permiten archivos de imagen");
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setDragImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setDragImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast.error("Solo se permiten archivos de imagen");
    }
  };

  const handleUploadImage = async () => {
    if (!dragImageFile || !entityId) return;

    try {
      // Use custom hook to upload image
      await uploadImage(dragImageFile);

      // Clear state after successful upload
      setDragImageFile(null);
      setDragImagePreview("");
    } catch (error: any) {
      // Error already handled in hook
      console.error('Error in handleUploadImage:', error);
    }
  };

  const handleRemoveDragImage = () => {
    setDragImageFile(null);
    setDragImagePreview("");
  };

  const canGenerateImage = word && !isGeneratingImage && !disabled;
  const showDragAndDrop = !dragImageFile; // Always show drag & drop
  const showDragPreview = dragImageFile && dragImagePreview;

  return (
    <Card className={`mt-4 ${className}`}>
      {(title || description) && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}

      <div className="flex flex-col lg:flex-row gap-6 justify-center items-center border-none">
        <div className="w-full lg:w-3/5">
          <div
            className={`w-full aspect-video rounded-md flex items-center justify-center relative overflow-hidden ${
              isGeneratingImage ? "ai-generating-border" : ""
            }`}
          >
            <div
              className={`w-full h-full rounded-md flex items-center justify-center relative overflow-hidden ${
                isGeneratingImage ? "inner-content" : ""
              }`}
            >
              {isGeneratingImage ? (
                // Skeleton during generation with AI touch
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-6">
                  {/* Spinner with AI glow */}
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/30 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-primary/20 rounded-full animate-pulse"></div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                  </div>

                  {/* Text with shine */}
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                      Generando con IA...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Creando imagen personalizada
                    </p>
                  </div>

                  {/* Subtle floating particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/40 rounded-full animate-bounce"></div>
                    <div
                      className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                </div>
              ) : showDragPreview ? (
                // Preview of dragged image
                <div className="relative w-full h-full">
                  <img
                    src={dragImagePreview}
                    alt="Vista previa de imagen"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleRemoveDragImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={deliveryImageUrl(imageUrl)}
                    alt={word || "Image"}
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => onImageChange("")}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <div className="text-xs">Sin imagen</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-2/5 space-y-4 flex flex-col justify-center">
          {showDragAndDrop && (
            <>
              {/* Drag and Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  isDragOver && !isGeneratingImage
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : isGeneratingImage
                    ? "border-gray-300/50 bg-gray-100/50 dark:bg-gray-800/50 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onDragOver={!isGeneratingImage ? handleDragOver : undefined}
                onDragLeave={!isGeneratingImage ? handleDragLeave : undefined}
                onDrop={!isGeneratingImage ? handleDrop : undefined}
              >
                <div className="space-y-2">
                  <div className="text-4xl">📁</div>
                  <p className="text-sm text-muted-foreground">
                    {isGeneratingImage ? (
                      <span className="text-gray-400 dark:text-gray-500">
                        Generando imagen... (arrastrar y soltar deshabilitado)
                      </span>
                    ) : isDragOver ? (
                      <span className="text-green-600 font-medium">
                        ¡Suelta tu imagen aquí!
                      </span>
                    ) : (
                      <>
                        {imageUrl ? (
                          <>
                            Arrastra una nueva imagen para reemplazar o{" "}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-primary hover:underline font-medium"
                            >
                              haz clic para seleccionar
                            </button>
                          </>
                        ) : (
                          <>
                            Arrastra tu imagen aquí o{" "}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-primary hover:underline font-medium"
                            >
                              haz clic para seleccionar
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.)
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Image URL and AI generation */}
              <div className="space-y-2">
                <Label htmlFor="image-url">URL de Imagen</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => onImageChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isGeneratingImage || disabled}
                  className="w-full"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateImage}
                  disabled={!canGenerateImage}
                  className="w-full"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      IA
                    </>
                  )}
                </Button>
                {!word && (
                  <p className="text-xs text-muted-foreground">
                    Necesitas una palabra para generar una imagen
                  </p>
                )}
              </div>
            </>
          )}

          {/* Upload image button when image is dragged */}
          {showDragPreview && (
            <div className="space-y-2">
              <Label>Imagen seleccionada: {dragImageFile?.name}</Label>
              <Button
                type="button"
                onClick={handleUploadImage}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Imagen
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Haz clic en "Subir Imagen" para procesar la imagen seleccionada
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
