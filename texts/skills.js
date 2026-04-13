// texts/skills.js — Skills section content
// Edit this file to update skills without touching any rendering logic.
// level: 0-100 (shown as health bar percentage)
// tags: string array — renders as tag cloud with no bars (use for qualitative skills)

export const skillCategories = [
  {
    id:    'tools',
    label: 'Dev Tools',
    skills: [
      { name: 'Git',                   level: 70 },
      { name: 'Docker',                level: 60 },
      { name: 'Linux',                 level: 65 },
      { name: 'LaTeX',                 level: 55 },
    ],
  },
  {
    id:    'robotics',
    label: 'Robotics & Autonomy',
    // No level bars — skill names only, rendered as tag cloud
    tags: [
      'ROS 1 / ROS 2',
      'Path Planning',
      'Motion Control',
      'Autonomous Navigation',
    ],
  },
  {
    id:     'cv',
    label:  'Computer Vision',
    skills: [
      { name: 'OpenCV',                level: 65 },
      { name: '3D Reconstruction',     level: 65 },
      { name: 'Object Detection',      level: 55 },
      { name: 'Edge Deployment',       level: 45 },
    ],
  },
  {
    id:     'ml',
    label:  'Machine Learning',
    skills: [
      { name: 'PyTorch',               level: 65 },
      { name: 'Reinforcement Learning',level: 55 },
      { name: 'NumPy / SciPy',         level: 65 },
      { name: 'Real-Time Inference',   level: 45 },
    ],
  },
  {
    id:     'languages',
    label:  'Programming Languages',
    skills: [
      { name: 'Python',                level: 60 },
      { name: 'C++',                   level: 20 },
      { name: 'MATLAB',                level: 50 },
      { name: 'JavaScript',            level: 30 },
    ],
  },
  {
    id:     'simulation',
    label:  'Simulation',
    skills: [
      { name: 'Gazebo',                level: 50 },
      { name: 'CoppeliaSim',           level: 50 },
      { name: 'Simulink',              level: 35 },
      { name: 'Cannon.js / Three.js',  level: 50 },
    ],
  },
  {
    id:     'aerospace',
    label:  'Aerospace Engineering',
    skills: [
      { name: 'Fluid Dynamics',        level: 65 },
      { name: 'Propulsion Systems',    level: 70 },
      { name: 'Thermal Management',    level: 60 },
      { name: 'Control Theory',        level: 80 },
    ],
  },
  {
    id:    'soft',
    label: 'Soft Skills',
    tags: [
      'Research-to-production mindset',
      'Cross-domain synthesis',
      'Communication',
      'Curiosity-driven learning',
    ],
  },
];
