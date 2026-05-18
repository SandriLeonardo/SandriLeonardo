// texts/projects.js — Projects list
// Edit this file to add/update projects without touching rendering logic.
// filters: array of category IDs — must match an id in projectFilters below.
// repo: full GitHub URL, or null if private.

export const projects = [
  {
    id:      'fieldrobotics',
    title:   'Autonomous Grapevine Pruning System',
    date:    'Nov 2025 – Feb 2026',
    org:     'FieldRobotics, Bologna',
    filters: ['robotics', 'cv', 'agriculture'],
    tags:    ['ROS 1', 'ROS 2', 'ABB Arm', 'OpenCV', '3D Reconstruction', 'Edge Deployment', 'Python'],
    summary: [
      'Developed an end-to-end autonomous pruning pipeline for commercial agricultural rover deployment.',
      'Integrated an ABB robotic arm with a ROS 1 computer vision pipeline using native ABB software and custom ROS interfaces.',
      'Built a 3D scene reconstruction module from stereo camera data for grapevine and obstacle detection in unstructured vineyard environments.',
      'Optimised CV models for edge deployment: handling dataset variance, variable lighting, and occlusion under real field conditions.',
    ],
    repo: null,   // private repository
  },
  {
    id:      'llmchallenge',
    title:   'LLM Jailbreaking Challenge — Generative AI Safety',
    date:    'Apr 2025',
    org:     'Sapienza University of Rome',
    filters: ['ml', 'llm'],
    tags:    ['Prompt Injection', 'LLM Red-Teaming', 'AI Safety', 'Adversarial ML', 'Python', 'Minerva'],
    summary: [
      'Only participant in the entire MSc cohort to fully solve the competitive red-teaming challenge, and the fastest — chosen over the standard written exam.',
      'Task: extract a secret word from Minerva (Sapienza\'s custom-deployed LLM) with no system-prompt access. Applied indirect context leakage, role-play framing, output steering, and multi-step chain attacks.',
      'Studied and applied five adversarial technique families: multilingual jailbreaking, structured prompt injection (HOUYI), Crescendo multi-turn escalation, sleeper agent triggers, and data poisoning with prefix-tuning.',
      'Graduate course covered RLHF, Constitutional AI, alignment stress-testing, model organisms of misalignment, and safety evaluation frameworks.',
    ],
    repo: 'https://github.com/DiTB42/LLM_Challenge',
  },
  {
    id:      'intercropgym',
    title:   'InterCropGym — RL for Agricultural Systems',
    date:    'Dec 2024 – Feb 2025',
    org:     'Sapienza University of Rome',
    filters: ['ml', 'agriculture'],
    tags:    ['Python', 'PyTorch', 'RL', 'DDQN', 'SAC', 'PPO', 'Precision Agriculture'],
    summary: [
      'Extended the CropGym simulation framework with the LINTUL3 crop growth engine for multi-crop environments.',
      'Implemented and benchmarked DDQN, SAC, and PPO reinforcement learning agents for precision agriculture decision-making.',
      'Applied RL to realistic crop management planning under environmental uncertainty and resource constraints.',
    ],
    repo: 'https://github.com/federicomatarante/InterCropGym',
  },
  {
    id:      'ddp',
    title:   'Differential Dynamic Programming (DDP)',
    date:    'Apr 2025 – May 2025',
    org:     'Sapienza University of Rome',
    filters: ['robotics'],
    tags:    ['Python', 'Control Theory', 'Trajectory Optimisation', 'iLQR', 'Non-linear Dynamics'],
    summary: [
      'Implemented trajectory optimisation algorithms for non-linear robotic systems using iterative LQR (iLQR) and DDP.',
      'Applied the solver to optimal control problems with complex dynamics and state/control constraints.',
      'Validated on cart-pendulum benchmark — nonlinear swing-up with constrained actuation.',
    ],
    repo: 'https://github.com/valerio98-lab/EC-DDP_CartPendulum',
  },
  {
    id:      'quadrotor',
    title:   'Quadrotor Autonomous Landing on Mobile Platform',
    date:    '2024',
    org:     'Sapienza University of Rome',
    filters: ['robotics', 'cv'],
    tags:    ['MATLAB', 'Simulink', 'Computer Vision', 'Quadrotor', 'Control Systems'],
    summary: [
      'Implemented a vision-based detection system for identifying and tracking a mobile landing platform from onboard camera footage.',
      'Designed and tuned quadrotor control laws in MATLAB/Simulink for autonomous approach and landing on a moving target.',
      'Integrated perception and control pipelines to achieve robust landing under platform motion and sensor noise.',
    ],
    repo: 'https://github.com/SandriLeonardo/quadrotor_landing_on_mobile_platform',
  },
  {
    id:      'simulation3d',
    title:   '3D Physics-Based Game Engine',
    date:    'Aug 2024 – Sep 2024',
    org:     'Personal Project',
    filters: ['cg'],
    tags:    ['JavaScript', 'Three.js', 'Cannon.js', 'WebGL', 'Pathfinding', 'Collision Detection'],
    summary: [
      'Built a complete 3D adventure game: scene graph, WebGL rendering pipeline, modular room architecture with dynamic loading, spatial audio, and interactive NPC systems.',
      'Integrated Cannon.js for physics-based character controller and collision detection; implemented hybrid animation system combining IK (CCDIKSolver) with keyframe interpolation.',
      'Implemented enemy AI with proximity-based behaviour and raycasting-based combat mechanics; custom pose control system with dat.GUI debug interface.',
    ],
    repo: 'https://github.com/SandriLeonardo/3D-Room-Game-THREE.js---Viviel',
  },
  {
    id:      'soyuz',
    title:   'Soyuz 2.1v Liquid Bipropellant Redesign',
    date:    '2021',
    org:     'Politecnico di Milano — Aerospace Propulsion Course',
    filters: ['aerospace'],
    tags:    ['MATLAB', 'NASA CEA', 'Propulsion', 'Rocket Design', 'Thermodynamics', 'Optimisation'],
    summary: [
      'Analysed the Soyuz 2.1v launcher — the lightweight LEO variant of the Soyuz family, originally propelled by LOX-RP1.',
      'Redesigned first and second stage propulsion systems by evaluating alternative liquid bipropellants (LOX-LH2, N2O4-UDMH, HNO3-UDMH) to maximise ΔV performance while maintaining the target mission profile.',
      'Built a custom MATLAB optimisation tool interfaced with NASA CEA for thermochemical analysis, nozzle design, tank sizing, and mass modelling — validated against known Soyuz performance data.',
      'Group project (5 members) for the BSc Aerospace Propulsion course, A.Y. 2020/21.',
    ],
    repo: 'https://github.com/SandriLeonardo/SojuzRedesign_PropulsionProject',
  },
];

// Filter button definitions — id must match values used in project.filters arrays above
export const projectFilters = [
  { id: 'all',      label: 'All' },
  { id: 'robotics', label: 'Robotics' },
  { id: 'cv',       label: 'Computer Vision' },
  { id: 'ml',       label: 'Machine Learning' },
  { id: 'llm',     label: 'LLM / AI Safety' },
  { id: 'cg',       label: 'Computer Graphics' },
  { id: 'aerospace',  label: 'Aerospace' },
  { id: 'agriculture', label: 'Agriculture' },
];
