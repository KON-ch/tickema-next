import Link from "next/link";
import { useState } from "react";
import LoginButton from './LoginButton';

import styles from '../styles/DrawerMenu.module.css'

type AppearanceStage = {
  id: number
  title: String
  appearanceUserId: String
}

type Props = {
  currentStageId: number
}

export default function DrawerMenu({ currentStageId }: Props) {
  const [stages, setStages] = useState<AppearanceStage[]>([]);
  const [openMenu, setOpenMenu] = useState(false);

  const getStages = async () => {
    const res = await fetch('/api/stages', { method: 'GET' });
    const stages = await res.json();
    setStages(stages);
  };

  const stageLists = (stage: AppearanceStage) => {
    if (stage.id === currentStageId) { return; }

    return(
      <li
        key={stage.id}
        onClick={ () => setOpenMenu(false) }
      >
        <Link
          href={`/stages/${encodeURIComponent(stage.id)}/schedules`}
        >
          {stage.title}
        </Link>
      </li>
    );
  };

  const menuStyle = openMenu ? styles.open : styles.close
  const openerStyle = openMenu ? styles.close : styles.open

  return(
    <>
      <button
        className={`${styles.openButton} ${openerStyle}`}
        onClick={ () => {
          getStages();
          setOpenMenu(true);
        }}
      >
        ≡
      </button>
      <div className={`${styles.menu} ${menuStyle}`}>
        <button
          onClick={ () => {
            setOpenMenu(false);
          }}
        >
          ✖
        </button>
        <div>
          <h3>予約管理</h3>
          <ul>
            {
              stages.map(stageLists)
            }
          </ul>
        </div>
        <div>
          <h3>設定</h3>
          <Link href='/stages/'>
            公演情報登録
          </Link>
        </div>
        <LoginButton />
      </div>
    </>
  )
}

