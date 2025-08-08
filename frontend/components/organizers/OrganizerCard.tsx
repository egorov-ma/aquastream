import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type Organizer = {
  id: string;
  slug: string;
  name: string;
};

export function OrganizerCard({ organizer }: { organizer: Organizer }) {
  return (
    <Card data-test-id={`org-card-${organizer.slug}`}>
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar>
          <AvatarFallback>{organizer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-base">
          <Link href={`/org/${organizer.slug}`} className="hover:underline">
            {organizer.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        @{organizer.slug}
      </CardContent>
    </Card>
  );
}


