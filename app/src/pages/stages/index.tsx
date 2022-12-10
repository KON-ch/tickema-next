import type { NextPage, GetServerSideProps } from 'next';
import LoginButton from '../../components/LoginButton';

import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form'

import { Button, IconButton }from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'

import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getSession(ctx)

  if (!session) {
    return { props: {} }
  }

  const user = await prisma.appearanceUser.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true
    }
  })

  if (!user) {
    return {
      redirect: {
        permanent: true,
        destination: '/'
      }
    }
  }

  const stages = await prisma.appearanceStage.findMany({
    where: { appearanceUserId: user.id },
    select: {
      id: true,
      title: true
    },
    orderBy: { id: 'desc' }
  });

  return { props: { stages, appearanceUserId: user.id } };
};

type AppearanceStage = {
  id: number
  title: string
};

type StageProps = {
  stages: AppearanceStage[]
  appearanceUserId: number
};

type SubmitData = {
  title: string
  performanceSchedules: { startedAt: string }[]
  saleTickets: { type: string, price: number }[]
}

const Page: NextPage<StageProps> = ({ stages, appearanceUserId }) => {
  const year = new Date().getFullYear()

  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      performanceSchedules: [
        { startedAt: `${year}-01-01T12:00` }
      ],
      saleTickets: [
        {
          type: '一般' ,
          price: 0,
        }
      ]
    },
  });

  const {
    fields: scheduleFields,
    append: scheduleAppend,
    remove: scheduleRemove
  } = useFieldArray({
    control,
    rules: { minLength: 1 },
    name: "performanceSchedules",
  });

  const {
    fields: saleTicketFields,
    append: saleTicketAppend,
    remove: saleTicketRemove
  } = useFieldArray({
    control,
    rules: { minLength: 1 },
    name: "saleTickets",
  });

  const formSubmit = async (data: SubmitData) => {
    const endpoint = '/api/stages';

    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        performanceSchedules: data.performanceSchedules.map(s => {
          const date = new Date(s.startedAt)
          date.setHours(date.getHours() + 9) // ISOString変換されるため、日本時刻9時間を追加
          return { startedAt: date }
        }),
        saleTickets: data.saleTickets,
        appearanceUserId: appearanceUserId
      }),
    };

    try {
      const res = await fetch(endpoint, options);
      const result: AppearanceStage = await res.json();

      setAppearanceStages([result, ...appearanceStages]);
      reset();
    } catch(e) {
      console.error(e);
    }
  };

  const [appearanceStages, setAppearanceStages] = useState(stages);

  const stageLink = (stage: AppearanceStage) => {
    return (
      <li key={stage.id}>
        <Link
          href={`/stages/${encodeURIComponent(stage.id)}/schedules`}
        >
          <a>「{stage.title}」</a>
        </Link>
      </li>
    )
  }

  return (
    <>
      <LoginButton />
      <form onSubmit={handleSubmit(formSubmit)}>
        <label>
          公演タイトル:
          <input
            type='text'
            required
            {...register('title')}
          />
        </label>
        <div>
          <Button
            type='button'
            variant="outlined"
            size="medium"
            onClick={() => scheduleAppend({ startedAt: `${year}-01-01T12:00` })}
          >
            日程追加
          </Button>
          <div>
            公演日程:
            {
              scheduleFields.map((field: {id: number}, index: number) => {
                return(
                  <div key={field.id}>
                    <input
                      type='datetime-local'
                      min={`${year}-01-01T00:00`}
                      max={`${year + 1}-12-31T00:00`}
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
                      required
                      {...register(`performanceSchedules.${index}.startedAt`)}
                    />
                    <IconButton
                      variant="text"
                      color="error"
                      size="small"
                      onClick={ ()=>{ scheduleRemove(index); }}
                      >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                )
              })
            }
          </div>
          <Button
            type='button'
            variant="outlined"
            size="medium"
            onClick={() => {
              saleTicketAppend(
                {
                  type: '',
                  price: 0,
                }
              )
            }}
          >
            チケット追加
          </Button>
          <div>
            チケット情報:
            {
              saleTicketFields.map((field: {id: number}, index: number) => {
                return(
                  <div key={field.id}>
                    <label>
                      種類:
                      <input
                        type='text'
                        minLength='1'
                        maxLength='255'
                        required
                        {...register(`saleTickets.${index}.type`)}
                      />
                    </label>
                    <label>
                      金額:
                      <input
                        type='number'
                        min={0}
                        max={9999}
                        required
                        {...register(`saleTickets.${index}.price`)}
                      />
                    </label>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={ ()=>{ saleTicketRemove(index); }}
                    >
                      削除
                    </Button>
                  </div>
                )
              })
            }
          </div>
        </div>
        <Button
          type="submit"
          variant="contained"
          color="success"
          size="large"
        >
          登録
        </Button>
      </form>
      <ol>
        {appearanceStages.map(stageLink)}
      </ol>
    </>
  );
};

export default Page
