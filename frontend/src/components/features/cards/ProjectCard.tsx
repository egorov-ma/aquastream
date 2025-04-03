import { Typography } from '../../ui';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  status: 'completed' | 'in-progress' | 'planned';
  difficulty: 'easy' | 'medium' | 'hard';
  date: string;
  tags: string[];
  onClick?: () => void;
  className?: string;
}

export const ProjectCard = ({
  title,
  description,
  image,
  status,
  difficulty,
  date,
  tags,
  onClick,
  className = '',
}: ProjectCardProps) => {
  // Определяем классы для статуса
  const statusClasses = {
    completed: 'bg-green-500',
    'in-progress': 'bg-yellow-500',
    planned: 'bg-blue-500',
  };

  // Определяем классы для сложности
  const difficultyClasses = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={title}
      data-testid={`project-card-${title}`}
    >
      <div className="relative h-48 w-full overflow-hidden group">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          data-testid="project-card-image"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium text-white ${statusClasses[status]}`}
            data-testid="project-card-status"
          >
            {status === 'completed'
              ? 'Завершен'
              : status === 'in-progress'
                ? 'В процессе'
                : 'Запланирован'}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="mb-2 flex items-center justify-between">
          <Typography variant="h6" className="font-bold" data-testid="project-card-title">
            {title}
          </Typography>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${difficultyClasses[difficulty]}`}
            data-testid="project-card-difficulty"
          >
            {difficulty === 'easy' ? 'Легкий' : difficulty === 'medium' ? 'Средний' : 'Сложный'}
          </span>
        </div>

        <Typography variant="body-2" className="mb-3 line-clamp-2 flex-grow text-gray-600 dark:text-gray-300" data-testid="project-card-description">
          {description}
        </Typography>

        <div className="mt-auto pt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-100"
              data-testid={`project-card-tag-${tag}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 text-right">
          <Typography variant="caption" className="text-gray-500 dark:text-gray-400" data-testid="project-card-date">
            {date}
          </Typography>
        </div>
      </div>
    </div>
  );
}; 