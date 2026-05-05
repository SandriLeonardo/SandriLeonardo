/**
 * contact.js — Renders the Contact section with social links + email form.
 * Form backend: Formspree (free tier). Replace formAction in texts/contact.js.
 */

import { contactData } from '../../texts/contact.js';
import { scatterText, runSectionEntrance } from './animator.js';

let initialised = false;

export function initContact() {
  if (initialised) return;
  initialised = true;

  const panel = document.querySelector('#sec-contact .panel-inner');
  panel.innerHTML = '';

  // Heading
  const h2 = document.createElement('h2');
  h2.setAttribute('data-scatter', '');
  h2.textContent = 'Contact';
  scatterText(h2);
  panel.appendChild(h2);

  // Social links
  const socials = document.createElement('div');
  socials.className = 'social-links';
  contactData.links.forEach(({ label, href, icon }) => {
    const a = document.createElement('a');
    a.className = 'social-link';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<span class="social-icon">${icon.toUpperCase()}</span><span>${label}</span>`;
    socials.appendChild(a);
  });
  panel.appendChild(socials);

  // Divider
  const div = document.createElement('p');
  div.className = 'contact-intro';
  div.textContent = 'Or send me a message directly:';
  panel.appendChild(div);

  // Contact form (Formspree)
  const form = document.createElement('form');
  form.className = 'contact-form';
  form.method = 'POST';
  form.action = contactData.formAction;
  form.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label for="cf-name">First & Last Name</label>
        <input id="cf-name" type="text" name="name" placeholder="Jane Doe" required />
      </div>
      <div class="form-group">
        <label for="cf-email">Your Email</label>
        <input id="cf-email" type="email" name="email" placeholder="jane@example.com" required />
      </div>
    </div>
    <div class="form-group">
      <label for="cf-subject">Subject</label>
      <input id="cf-subject" type="text" name="subject" placeholder="Thesis collaboration / Job offer / …" required />
    </div>
    <div class="form-group">
      <label for="cf-message">Message</label>
      <textarea id="cf-message" name="message" rows="5" placeholder="Your message…" required></textarea>
    </div>
    <button type="submit" class="form-submit">Send Message</button>
    <p class="form-privacy">Your data is sent via <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener">Formspree</a> and used only to reply to you.</p>
    <p id="form-status" class="form-status" aria-live="polite"></p>
  `;

  const status = form.querySelector('#form-status');
  const submitBtn = form.querySelector('.form-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    status.textContent = '';
    status.className = 'form-status';

    try {
      const res = await fetch(contactData.formAction, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        form.reset();
        status.textContent = 'Message sent — I will get back to you soon.';
        status.classList.add('form-status--ok');
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
      } else {
        const data = await res.json().catch(() => ({}));
        status.textContent = data?.errors?.[0]?.message ?? 'Something went wrong. Try again or email me directly.';
        status.classList.add('form-status--err');
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
      }
    } catch {
      status.textContent = 'Network error. Check your connection and try again.';
      status.classList.add('form-status--err');
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
    }
  });

  panel.appendChild(form);
}

export function enterContact() {
  initContact();
  runSectionEntrance(document.getElementById('sec-contact'));
}
