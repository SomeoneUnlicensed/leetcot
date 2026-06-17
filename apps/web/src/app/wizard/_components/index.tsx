'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { useSession } from '@repo/auth/react';
import { Form } from '@repo/ui/components/form';
import type { TsErrors } from '@repo/monaco';
import { ChallengeCardEditor } from './ChallengeCardEditor';
import { DescriptionEditor } from './DescriptionEditor';
import { Steps } from './Steps';
import { NextBack } from './NextBack';
import { Summary } from './Summary';
import { TestCasesEditor } from './TestCasesEditor';
import { uploadChallenge } from './create.action';
import { DEFAULT_CHALLENGE_TEMPLATE, DEFAULT_TEST_CASES, DEFAULT_DESCRIPTION } from './templates';
import {
  createNoProfanitySchema,
  createNoProfanitySchemaWithValidate,
} from '~/utils/antiProfanityZod';

export const enum STEPS {
  ChallengeCard,
  Description,
  TestCases,
  Summary,
}

const testCaseRegex = new RegExp('(?:\n|^)s*(?:Equal|Extends|NotEqual|Expect)<');
const createExploreCardSchema = z.object({
  difficulty: z.enum(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXTREME', 'EVENT']),
  name: createNoProfanitySchemaWithValidate((zodString) =>
    zodString
      .min(3, 'Название должно быть длиннее 3 символов')
      .max(30, 'Название должно быть короче 30 символов'),
  ),
  shortDescription: createNoProfanitySchemaWithValidate((zodString) =>
    zodString
      .min(10, 'Краткое описание должно быть длиннее 10 символов')
      .max(191, 'Краткое описание должно быть короче 191 символа'),
  ),
  isInfoOnly: z.boolean().default(false),
});

const createDescriptionSchema = z.object({
  description: createNoProfanitySchemaWithValidate((zodString) =>
    zodString.min(20, 'Описание должно быть длиннее 20 символов').max(65536),
  ),
});

const createTestCasesSchema = z.object({
  tests: z.string().optional(),
  code: z.string().optional(),
});

export const createChallengeSchema = createExploreCardSchema
  .merge(createDescriptionSchema)
  .merge(createTestCasesSchema)
  .superRefine((data, ctx) => {
    if (!data.isInfoOnly) {
      if (!data.tests || data.tests.length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Тестовые случаи должны быть длиннее 20 символов',
          path: ['tests'],
        });
      } else if (!testCaseRegex.test(data.tests)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'В задаче должны быть тестовые случаи',
          path: ['tests'],
        });
      }
      if (!data.code || data.code.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Код шаблона решения обязателен',
          path: ['code'],
        });
      }
    }
  });

export interface Step {
  id: string;
  name: string;
  schema?: z.ZodSchema;
}

export type CreateChallengeSchema = z.infer<typeof createChallengeSchema>;

export type WizardForm = UseFormReturn<CreateChallengeSchema>;

export function Wizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [rendered, setRendered] = useState(false);
  const [tsErrors, setTsErrors] = useState<TsErrors>([[], [], []]);

  const isUserACreator = useMemo(
    () => session?.user?.role.includes('CREATOR') ?? false,
    [session?.user?.role],
  );

  const hasTsErrors = useMemo(() => tsErrors.some((e: unknown[]) => e.length), [tsErrors]);
  const form = useForm<CreateChallengeSchema>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      name: '',
      difficulty: 'BEGINNER',
      description: DEFAULT_DESCRIPTION,
      tests: DEFAULT_TEST_CASES,
      code: DEFAULT_CHALLENGE_TEMPLATE,
      isInfoOnly: false,
    },
  });

  const isInfoOnly = form.watch('isInfoOnly');

  const currentSteps = useMemo(() => {
    if (isInfoOnly) {
      return [
        { id: '1', name: 'Карточка задачи', schema: createExploreCardSchema },
        { id: '2', name: 'Описание', schema: createDescriptionSchema },
        { id: '4', name: 'Итог' },
      ];
    }
    return [
      { id: '1', name: 'Карточка задачи', schema: createExploreCardSchema },
      { id: '2', name: 'Описание', schema: createDescriptionSchema },
      { id: '3', name: 'Тестовые случаи', schema: createTestCasesSchema },
      { id: '4', name: 'Итог' },
    ];
  }, [isInfoOnly]);

  useEffect(() => {
    setRendered(true);

    const handleBeforeUnload: EventListenerOrEventListenerObject = (event) => {
      event.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      event.returnValue = false;
    };

    window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });

    return () => {
      // Clean up the event listener when the component unmounts
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Reset step if currentSteps changes and current step index is out of bounds
  useEffect(() => {
    if (step >= currentSteps.length) {
      setStep(currentSteps.length - 1);
    }
  }, [currentSteps, step]);

  const handleNextClick = async () => {
    const currentStepObj = currentSteps[step];
    const schema = currentStepObj?.schema;
    const success = schema ? schema.safeParse(form.getValues()).success : true;

    if (success) {
      // if they are currently on test cases do not let them go to next step
      // until a type error exists
      if (currentStepObj?.id === '3') {
        if (!hasTsErrors) return;
      }
      setStep((step) => step + 1);
    } else {
      await form.trigger();
    }
  };

  async function onSubmit(data: CreateChallengeSchema) {
    const finalData = {
      ...data,
      code: data.isInfoOnly ? (data.code || '') : (data.code ?? ''),
      tests: data.isInfoOnly ? (data.tests || '') : (data.tests ?? ''),
    };
    const { id } = await uploadChallenge(finalData, isUserACreator);

    router.refresh();

    if (isUserACreator) {
      router.push(`/challenge/${id}`);
    } else {
      router.push(`/explore`);
    }
  }

  const currentStepId = currentSteps[step]?.id;

  return (
    <div className="flex h-full flex-col gap-4 pb-4 pt-4 lg:gap-6 lg:pb-8">
      {/* we cant nest this in the form because it causes the editor to resize inifinitely hence the onSubmit(wtf..) */}
      <Steps current={step} onChange={(idx) => setStep(idx)} steps={currentSteps} />
      {rendered ? (
        <Form {...form}>
          <form
            className={`container ${
              (currentStepId === '2' || currentStepId === '3') && 'h-full'
            }`}
          >
            {currentStepId === '1' && <ChallengeCardEditor form={form} />}
            {currentStepId === '2' && <DescriptionEditor form={form} />}
            {currentStepId === '3' && (
              <TestCasesEditor form={form} hasTsErrors={hasTsErrors} setTsErrors={setTsErrors} />
            )}
            {currentStepId === '4' && <Summary isUserACreator={isUserACreator} />}
          </form>
        </Form>
      ) : null}
      <NextBack
        current={step}
        onChange={(idx) => setStep(idx)}
        onNext={handleNextClick}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
      />
    </div>
  );
}
