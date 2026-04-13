// texts/about.js — About section content
// Derived from cover letters: Nintendo, ESA, Lamborghini, FieldRobotics.
// Edit this file to update the About section without touching rendering logic.
//
// TODO: review remaining CV versions in C:\Users\leosa\Documents\università\curriculum\versioni\
//       (nvidia, agrico, dallara, tohoku, tu delft, varaha, disney, thales, brembo...)
//       for additional themes or phrasing worth incorporating.
// TODO: check LinkedIn profile (linkedin.com/in/leonardosandriaeroairobotics) for any
//       summary or experience wording that differs from the cover letters, reconcile tone.

export const aboutData = {
  tagline: 'MSc AI & Robotics · BSc Aerospace Engineering',

  bio: [
    "What drives me is impact on the real world. I want the systems I build to leave the lab, find a place in a real workflow, and do something that matters — for a company, for an industry, for the people working in it. That is not a vague aspiration: it is the filter I apply when choosing problems, and it sustains the depth of engagement that good engineering demands.",

    "My approach to engineering has always been systems-first. I like thinking end-to-end, from mathematical assumption through to deployment constraint, and I developed an early instinct for handling what the computational cost of a solution is before committing to it: not because optimisation is aesthetically pleasing, but because real systems fail at the boundaries that theory ignores. I track every design decision deliberately, from abstraction to physical constraint. That discipline is one of the most useful things I own.",

    "The trajectory from Aerospace Engineering at Politecnico di Milano to AI & Robotics at Sapienza was extremely stimulating. Aerospace gave me the analytical substrate: systems thinking, physical intuition, an engineering mindset, mechanics and dynamics foundation, and habit of distinguishing between what is correct in theory and what is tractable in practice. AI & Robotics gave me the tools to direct that substrate toward machines that perceive, decide, and act. My MSc thesis at FieldRobotics was the point where both met reality: integrating an ABB robotic arm with a ROS1 computer vision pipeline for autonomous grapevine pruning, in an actual vineyard, under real agricultural conditions. From 3D scene reconstruction to field deployment — that project is a clear expression of how I want to work.",

    "The breadth of my background feeds the engineering rather than diluting it. I have been genuinely fascinated by space since long before I chose a degree — not just as a technical frontier, but as a domain that raises questions about scale, time, and physical law. A deep interest in sustainable agriculture and in what it means to deploy autonomous machines in service of environmental goals is not separate from the work: it is part of why the work feels worth doing. Outside engineering, I read widely — history, philosophy, biology — write, draw, and find animation compelling for the same reason I find robotics compelling: both are attempts to construct believable, purposeful motion from first principles.",
  ],

  facts: [
    { label: 'Location',   value: 'Brescia / Rome / Bologna, Italy' },
    { label: 'Languages',  value: 'Italian (native) · English C1 (TOEIC 965/990)' },
    { label: 'Available',  value: 'Immediately — graduating ceremony May 2026' },
    { label: 'Interests',  value: 'Space · Writing & drawing · Gaming · Sustainable agriculture · History' },
  ],
};
