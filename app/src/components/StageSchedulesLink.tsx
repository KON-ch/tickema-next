import { AppearanceStage } from '@prisma/client';
import Link from "next/link";

type Props = {
  stage: AppearanceStage
  children: React.ReactNode
}

export default function StageScheduleLink({ stage, children }: Props) {
  return (
    <Link
      href={`/stages/${encodeURIComponent(stage.id)}/schedules`}
    >
      {children}
    </Link>
  )
}
