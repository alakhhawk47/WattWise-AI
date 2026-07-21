// Classroom Grid — responsive grid of classroom cards

import type { Classroom } from "@/types";
import { ClassroomCard } from "./ClassroomCard";

interface ClassroomGridProps {
  classrooms: Classroom[];
}

export function ClassroomGrid({ classrooms }: ClassroomGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {classrooms.map((classroom) => (
        <ClassroomCard key={classroom.id} classroom={classroom} />
      ))}
    </div>
  );
}
