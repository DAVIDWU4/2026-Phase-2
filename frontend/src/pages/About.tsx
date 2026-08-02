import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/useTranslation';

export default function About() {
  const { t } = useTranslation();

  const features = [
    { icon: '📝', titleKey: 'about.feature.log.title' as const, descKey: 'about.feature.log.desc' as const },
    { icon: '🔥', titleKey: 'about.feature.streak.title' as const, descKey: 'about.feature.streak.desc' as const },
    { icon: '🏆', titleKey: 'about.feature.score.title' as const, descKey: 'about.feature.score.desc' as const },
    { icon: '🎯', titleKey: 'about.feature.badge.title' as const, descKey: 'about.feature.badge.desc' as const },
    { icon: '👤', titleKey: 'about.feature.profile.title' as const, descKey: 'about.feature.profile.desc' as const },
    { icon: '🌙', titleKey: 'about.feature.theme.title' as const, descKey: 'about.feature.theme.desc' as const },
  ];

  const techStack = [
    { name: 'React', descKey: 'about.tech.react' as const },
    { name: 'TypeScript', descKey: 'about.tech.ts' as const },
    { name: 'React Router', descKey: 'about.tech.router' as const },
    { name: 'Zustand', descKey: 'about.tech.zustand' as const },
    { name: 'Tailwind CSS', descKey: 'about.tech.tailwind' as const },
    { name: '.NET 10', descKey: 'about.tech.dotnet' as const },
    { name: 'Entity Framework', descKey: 'about.tech.ef' as const },
    { name: 'PostgreSQL', descKey: 'about.tech.postgres' as const },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">ℹ️</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('about.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('about.subtitle')}</p>
        </div>
      </div>

      <div className="card mb-8">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{t('about.intro1')}</p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('about.intro2')}</p>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('about.featuresTitle')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {features.map((feature) => (
          <div key={feature.titleKey} className="card hover:-translate-y-1 transition-transform duration-200">
            <span className="text-3xl block mb-3">{feature.icon}</span>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t(feature.titleKey)}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t(feature.descKey)}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('about.techTitle')}</h2>
      <div className="card">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <div key={tech.name} className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl text-center hover:shadow-md transition-shadow">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{tech.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t(tech.descKey)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-lg">
          <span className="text-lg">💡</span>
          <span className="text-gray-600 dark:text-gray-300">{t('about.footerNote')}</span>
        </div>
      </div>

      <LanguageSwitcher />
    </div>
  );
}
