import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Organizer = {
  id: string;
  slug: string;
  name: string;
};

export function OrganizerCard({ organizer }: { organizer: Organizer }) {
  const initials = organizer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Card data-test-id={`org-card-${organizer.slug}`} className="w-full min-h-28 [contain:content]">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg font-semibold">{initials}</span>
          </div>
          <div>
            <CardTitle>{organizer.name}</CardTitle>
            <p className="text-sm text-muted-foreground">@{organizer.slug}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Организатор</span>
            <span>{organizer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Слаг</span>
            <span>@{organizer.slug}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/org/${organizer.slug}`}>Открыть</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/org/${organizer.slug}/events`}>События</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


