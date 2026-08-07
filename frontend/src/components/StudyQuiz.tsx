import { useEffect, useMemo, useState } from 'react';
import { getQuizForSubject, type QuizQuestion } from '../data/studyQuiz';
import { useTranslation } from '../i18n/useTranslation';
import { useLocaleStore } from '../stores/localeStore';

interface StudyQuizProps {
  subjectId: string;
  /** Larger layout for the focused study session screen */
  focus?: boolean;
}

function pickNext(pool: QuizQuestion[], excludeId?: string): QuizQuestion | null {
  const candidates = excludeId ? pool.filter(q => q.id !== excludeId) : pool;
  if (candidates.length === 0) return pool[0] ?? null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function StudyQuiz({ subjectId, focus = false }: StudyQuizProps) {
  const { t } = useTranslation();
  const locale = useLocaleStore(s => s.locale);
  const pool = useMemo(() => getQuizForSubject(subjectId), [subjectId]);

  const [question, setQuestion] = useState<QuizQuestion | null>(() => pickNext(pool));
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    setQuestion(pickNext(pool));
    setSelected(null);
  }, [pool]);

  if (!question || pool.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-10">
        {t('common.noData')}
      </p>
    );
  }

  const content = locale === 'zh' ? question.zh : question.en;
  const revealed = selected !== null;
  const isCorrect = selected === content.correct;

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setAnsweredCount(n => n + 1);
    if (index === content.correct) setCorrectCount(n => n + 1);
  };

  const handleNext = () => {
    setQuestion(pickNext(pool, question.id));
    setSelected(null);
  };

  return (
    <div
      className={
        focus
          ? 'space-y-5'
          : 'rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 space-y-3'
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${focus ? 'text-lg' : 'text-sm'}`}>
            🧠 {t('quiz.title')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('quiz.subtitle')}</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
          {t('quiz.score', { correct: correctCount, total: answeredCount })}
        </span>
      </div>

      <p className={`font-medium text-gray-900 dark:text-gray-100 ${focus ? 'text-xl leading-relaxed' : 'text-sm'}`}>
        {content.q}
      </p>

      <div className={`grid gap-2.5 ${focus ? 'sm:grid-cols-1' : ''}`}>
        {content.options.map((option, index) => {
          let style =
            'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-300';
          if (revealed) {
            if (index === content.correct) {
              style = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
            } else if (index === selected) {
              style = 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200';
            } else {
              style = 'border-gray-200 dark:border-dark-600 bg-white/50 dark:bg-dark-800/50 opacity-60';
            }
          } else if (selected === index) {
            style = 'border-primary-500 bg-primary-50 dark:bg-primary-900/40';
          }

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              disabled={revealed}
              onClick={() => handleSelect(index)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all disabled:cursor-default ${
                focus ? 'text-base' : 'text-sm py-2.5 px-3 rounded-lg'
              } ${style}`}
            >
              <span className="font-medium mr-2 text-gray-400">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="space-y-3">
          <p className={`font-medium ${focus ? 'text-base' : 'text-sm'} ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isCorrect ? t('quiz.correct') : t('quiz.wrong')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{content.explain}</p>
          <button type="button" onClick={handleNext} className="btn-primary w-full py-3 text-sm">
            {t('quiz.next')}
          </button>
        </div>
      )}
    </div>
  );
}
