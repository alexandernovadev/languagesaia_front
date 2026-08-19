import { useEffect, useState } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { StatCard } from "@/shared/components/dashboard/StatCard";
import { DistributionCard } from "@/shared/components/dashboard/DistributionCard";
import { RecentActivityCard } from "@/shared/components/dashboard/RecentActivityCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { statsService } from "@/services/statsService";
import { DashboardStats } from "@/types/stats";
import {
  BookOpen,
  BookText,
  MessageSquare,
  Users,
  Eye,
  Clock,
  Image as ImageIcon,
  Music,
  FileText,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMarkdownTitle } from "@/utils/common/string/markdown";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error("Error al cargar estadísticas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" />
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No se pudieron cargar las estadísticas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Dashboard Gerencial"
      />

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Palabras"
          value={stats.words.total.toLocaleString()}
          subtitle={`${stats.words.withImage} con imagen`}
          icon={BookOpen}
          iconColor="text-blue-600"
          bgGradient="from-blue-500/10 to-blue-400/5"
          onClick={() => navigate("/words")}
        />
        <StatCard
          title="Total Lecturas"
          value={stats.lectures.total.toLocaleString()}
          subtitle={`${Math.round(stats.lectures.totalReadingTime)} min totales`}
          icon={BookText}
          iconColor="text-green-600"
          bgGradient="from-green-500/10 to-green-400/5"
          onClick={() => navigate("/lectures")}
        />
        <StatCard
          title="Total Expresiones"
          value={stats.expressions.total.toLocaleString()}
          subtitle={`${stats.expressions.withContext} con contexto`}
          icon={MessageSquare}
          iconColor="text-purple-600"
          bgGradient="from-purple-500/10 to-purple-400/5"
          onClick={() => navigate("/expressions")}
        />
        <StatCard
          title="Total Usuarios"
          value={stats.users.total.toLocaleString()}
          subtitle={`${stats.users.active} activos`}
          icon={Users}
          iconColor="text-orange-600"
          bgGradient="from-orange-500/10 to-orange-400/5"
          onClick={() => navigate("/users")}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Vistas Totales"
          value={stats.words.totalViews.toLocaleString()}
          icon={Eye}
          iconColor="text-cyan-600"
          bgGradient="from-cyan-500/10 to-cyan-400/5"
        />
        <StatCard
          title="Tiempo Lectura"
          value={`${Math.round(stats.lectures.totalReadingTime)} min`}
          icon={Clock}
          iconColor="text-indigo-600"
          bgGradient="from-indigo-500/10 to-indigo-400/5"
        />
        <StatCard
          title="Con Imágenes"
          value={`${stats.words.withImage + stats.lectures.withImage + stats.expressions.withImage}`}
          subtitle="Total de recursos"
          icon={ImageIcon}
          iconColor="text-pink-600"
          bgGradient="from-pink-500/10 to-pink-400/5"
        />
        <StatCard
          title="Con Audio"
          value={stats.lectures.withAudio.toLocaleString()}
          subtitle="Lecturas con audio"
          icon={Music}
          iconColor="text-teal-600"
          bgGradient="from-teal-500/10 to-teal-400/5"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <DistributionCard
          title="Palabras por Dificultad"
          icon={BarChart3}
          data={{
            easy: stats.words.byDifficulty.easy,
            medium: stats.words.byDifficulty.medium,
            hard: stats.words.byDifficulty.hard,
          }}
          total={stats.words.total}
          colors={{
            easy: "bg-green-500",
            medium: "bg-yellow-500",
            hard: "bg-red-500",
          }}
        />
        <DistributionCard
          title="Lecturas por Nivel"
          icon={TrendingUp}
          data={stats.lectures.byLevel}
          total={stats.lectures.total}
          colors={{
            A1: "bg-blue-200",
            A2: "bg-blue-300",
            B1: "bg-blue-400",
            B2: "bg-blue-500",
            C1: "bg-blue-600",
            C2: "bg-blue-700",
          }}
        />
        <DistributionCard
          title="Expresiones por Dificultad"
          icon={FileText}
          data={stats.expressions.byDifficulty}
          total={stats.expressions.total}
          colors={{
            easy: "bg-green-500",
            medium: "bg-yellow-500",
            hard: "bg-red-500",
          }}
        />
      </div>

      {/* Language Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <DistributionCard
          title="Palabras por Idioma"
          icon={BookOpen}
          data={stats.words.byLanguage}
          total={stats.words.total}
        />
        <DistributionCard
          title="Lecturas por Idioma"
          icon={BookText}
          data={stats.lectures.byLanguage}
          total={stats.lectures.total}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <RecentActivityCard
          title="Palabras Recientes"
          icon={BookOpen}
          items={stats.recentActivity.words}
          type="words"
          getItemTitle={(item) => (item as any).word || "Sin título"}
          getItemSubtitle={(item) => (item as any).definition?.substring(0, 50) + "..."}
          getItemBadge={(item) => (item as any).difficulty}
        />
        <RecentActivityCard
          title="Lecturas Recientes"
          icon={BookText}
          items={stats.recentActivity.lectures}
          type="lectures"
          getItemTitle={(item) => {
            const lecture = item as any;
            return getMarkdownTitle(lecture.content) || lecture.typeWrite || "Sin título";
          }}
          getItemSubtitle={(item) => {
            const lecture = item as any;
            return `${lecture.difficulty || "N/A"} • ${lecture.language || "N/A"}`;
          }}
          getItemBadge={(item) => (item as any).typeWrite}
        />
        <RecentActivityCard
          title="Expresiones Recientes"
          icon={MessageSquare}
          items={stats.recentActivity.expressions}
          type="expressions"
          getItemTitle={(item) => (item as any).expression || "Sin título"}
          getItemSubtitle={(item) => (item as any).definition?.substring(0, 50) + "..."}
          getItemBadge={(item) => (item as any).difficulty}
        />
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Palabras con Ejemplos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold break-words">{stats.words.withExamples}</div>
            <p className="text-xs text-muted-foreground truncate">
              {((stats.words.withExamples / stats.words.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Palabras con Sinónimos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold break-words">{stats.words.withSynonyms}</div>
            <p className="text-xs text-muted-foreground truncate">
              {((stats.words.withSynonyms / stats.words.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Expresiones con Contexto</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold break-words">{stats.expressions.withContext}</div>
            <p className="text-xs text-muted-foreground truncate">
              {((stats.expressions.withContext / stats.expressions.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold break-words">{stats.users.active}</div>
            <p className="text-xs text-muted-foreground truncate">
              {((stats.users.active / stats.users.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
