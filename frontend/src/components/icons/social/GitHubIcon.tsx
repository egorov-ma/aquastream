import React from 'react';

type GitHubIconProps = {
  className?: string;
};

const GitHubIcon: React.FC<GitHubIconProps> = ({ className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width="24"
      height="24"
    >
      <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.53v-1.85c-3.01.65-3.64-1.46-3.64-1.46-.5-1.29-1.23-1.64-1.23-1.64-1-.7.08-.68.08-.68 1.1.08 1.7 1.16 1.7 1.16.98 1.72 2.56 1.22 3.2.94.1-.73.4-1.22.72-1.5-2.52-.28-5.18-1.27-5.18-5.67 0-1.25.44-2.27 1.17-3.08-.12-.28-.5-1.43.11-3 0 0 .96-.3 3.15 1.2a11 11 0 016 0c2.17-1.5 3.13-1.2 3.13-1.2.62 1.57.22 2.72.1 3 .73.81 1.17 1.83 1.17 3.08 0 4.42-2.67 5.39-5.2 5.67.4.35.77 1.05.77 2.1v3.12c0 .29.19.63.74.52A11 11 0 0012 1.27" />
    </svg>
  );
};

export default GitHubIcon;
