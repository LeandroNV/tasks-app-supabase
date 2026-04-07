import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold tracking-tight flex items-center gap-3 ">
          <LayoutGrid size={32} />
          Gestor de Tareas
        </div>

        <Link href="/profile">
          <AvatarBadge name="Yorch Dev" />
        </Link>
      </nav>
    </>
  );
}
