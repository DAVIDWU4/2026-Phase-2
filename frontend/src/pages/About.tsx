export default function About() {
  const features = [
    {
      icon: '📝',
      title: 'Log Study Sessions',
      description: 'Track your study time with subject and duration for each session.'
    },
    {
      icon: '🔥',
      title: 'Streak Tracking',
      description: 'Automatic continuous streak calculation to keep you motivated.'
    },
    {
      icon: '🏆',
      title: 'Score System',
      description: 'Earn points for your study sessions and climb the leaderboard.'
    },
    {
      icon: '🎯',
      title: 'Badge Achievements',
      description: 'Unlock badges based on your learning achievements and milestones.'
    },
    {
      icon: '👤',
      title: 'Personal Profile',
      description: 'View your statistics, level, and progress over time.'
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Switch between light and dark themes for comfortable viewing.'
    }
  ];

  const techStack = [
    { name: 'React', desc: 'Frontend framework' },
    { name: 'TypeScript', desc: 'Type-safe development' },
    { name: 'React Router', desc: 'Client-side routing' },
    { name: 'Zustand', desc: 'State management' },
    { name: 'Tailwind CSS', desc: 'Styling framework' },
    { name: '.NET 10', desc: 'Backend API' },
    { name: 'Entity Framework', desc: 'Database ORM' },
    { name: 'SQLite', desc: 'Lightweight database' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">ℹ️</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About StudyTracker</h1>
          <p className="text-gray-500 dark:text-gray-400">Learn more about our learning platform</p>
        </div>
      </div>

      <div className="card mb-8">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          StudyTracker is a full-stack web application designed to help you record daily learning time, 
          track continuous study streaks, and stay motivated through points and badge achievements.
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Whether you're a student, professional, or lifelong learner, StudyTracker provides 
          the tools you need to stay consistent and achieve your learning goals.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Core Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="card hover:-translate-y-1 transition-transform duration-200"
          >
            <span className="text-3xl block mb-3">{feature.icon}</span>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Tech Stack</h2>
      <div className="card">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl text-center hover:shadow-md transition-shadow"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{tech.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-lg">
          <span className="text-lg">💡</span>
          <span className="text-gray-600 dark:text-gray-300">
            This project is developed for learning practice and skill development.
          </span>
        </div>
      </div>
    </div>
  );
}