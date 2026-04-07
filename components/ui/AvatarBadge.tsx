import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AvatarBadgeProps {
  name: string | null;
  avatar_url?: string;
}

export const AvatarBadge = ({ name, avatar_url }: AvatarBadgeProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Badge className="gap-2">
      <Avatar>
        <AvatarImage src={avatar_url || ""} />
        <AvatarFallback className="text-neutral-500">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {name}
    </Badge>
  );
};
