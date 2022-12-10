import Prisma from '@prisma/client'
import Link from "next/link";


type Props = {
  stage: AppearanceStage
}

export default function StageScheduleLink({ stage }: Props) {
  return (
    <Link
      href={`/stages/${encodeURIComponent(stage.id)}/schedules`}
    >
      {stage.title}
    </Link>
  )
}
