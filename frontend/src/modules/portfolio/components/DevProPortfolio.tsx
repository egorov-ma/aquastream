import React from 'react';

import { EmailIcon, GitHubIcon, LinkedInIcon, OpenInNewIcon } from '@/components/icons/social';

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
}

interface Skill {
  name: string;
  icon: React.ReactNode;
}

interface Testimonial {
  text: string;
  author: string;
  role: string;
  avatar: string;
}

interface DevProPortfolioProps {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  projects: Project[];
  skills: Skill[];
  testimonials: Testimonial[];
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
}

const DevProPortfolio: React.FC<DevProPortfolioProps> = ({
  name,
  title,
  bio,
  avatar,
  projects,
  skills,
  testimonials,
  contactEmail,
  githubUrl,
  linkedinUrl,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Хедер */}
      <header className="py-6 bg-primary-600 dark:bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-lg mt-2">{title}</p>
        </div>
      </header>

      {/* О себе */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={avatar}
              alt={name}
              className="w-48 h-48 rounded-full object-cover border-4 border-primary-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">О себе</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{bio}</p>
              <div className="mt-6 flex space-x-4">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <EmailIcon className="w-6 h-6 mr-2" />
                  <span>Email</span>
                </a>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <GitHubIcon className="w-6 h-6 mr-2" />
                  <span>GitHub</span>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <LinkedInIcon className="w-6 h-6 mr-2" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Проекты */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Мои проекты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
              >
                <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      <GitHubIcon className="w-5 h-5 mr-1" />
                      <span>GitHub</span>
                    </a>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      <span>Демо</span>
                      <OpenInNewIcon className="w-5 h-5 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Навыки */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Мои навыки
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 mb-4">{skill.icon}</div>
                <span className="text-gray-800 dark:text-white font-medium">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Отзывы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">
                      {testimonial.author}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section className="py-12 bg-primary-600 dark:bg-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Связаться со мной</h2>
          <div className="flex justify-center space-x-6">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center hover:text-primary-200 transition-colors"
            >
              <EmailIcon className="w-6 h-6 mr-2" />
              <span>{contactEmail}</span>
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-primary-200 transition-colors"
            >
              <GitHubIcon className="w-6 h-6 mr-2" />
              <span>GitHub</span>
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-primary-200 transition-colors"
            >
              <LinkedInIcon className="w-6 h-6 mr-2" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="py-4 bg-gray-900 text-gray-400 text-center">
        <div className="container mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} {name}. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DevProPortfolio;
