import { test, expect } from '@playwright/test';

const viewports = [
  // Mobile
  { name: 'Mobile 320x568', width: 320, height: 568 },
  { name: 'Mobile 360x800', width: 360, height: 800 },
  { name: 'Mobile 375x812', width: 375, height: 812 },
  { name: 'Mobile 390x844', width: 390, height: 844 },
  { name: 'Mobile 412x915', width: 412, height: 915 },
  { name: 'Mobile 430x932', width: 430, height: 932 },

  // Tablet
  { name: 'Tablet 768x1024', width: 768, height: 1024 },
  { name: 'Tablet 820x1180', width: 820, height: 1180 },

  // Desktop
  { name: 'Desktop 1024x768', width: 1024, height: 768 },
  { name: 'Desktop 1280x720', width: 1280, height: 720 },
  { name: 'Desktop 1440x900', width: 1440, height: 900 },
  { name: 'Desktop 1920x1080', width: 1920, height: 1080 },
];

const mockUser = {
  id: 1,
  username: 'alex',
  full_name: 'Alex Rivera',
  email: 'alex@example.com',
  role: 'freelancer',
  is_staff: true,
  unread_messages: 2,
  unread_notifications: 1,
  avatar: null,
};

const mockFreelancers = [
  {
    id: 1,
    username: 'alex',
    full_name: 'Alex Rivera',
    title: 'Principal Full-Stack & AI Architect',
    bio: '10+ years crafting distributed systems and bespoke React / Django architectures.',
    location: 'San Francisco, CA',
    hourly_rate: 95,
    availability: 'available',
    avatar_url: null,
    skills: ['React', 'Python', 'PostgreSQL', 'AI', 'Node.js'],
    avg_rating: 4.98,
    review_count: 48,
    is_favourite: false,
    portfolio: [
      { id: 1, title: 'AI Design Engine', description: 'Real-time vector search & canvas.' },
      { id: 2, title: 'Global Escrow API', description: 'Financial ledger & payout pipeline.' }
    ],
    reviews: [
      { id: 1, reviewer: 'Elena Rostova', rating: 5, comment: 'Outstanding engineering leadership.' }
    ]
  },
  {
    id: 2,
    username: 'sophia',
    full_name: 'Sophia Laurent',
    title: 'Artisanal UI/UX & Brand Director',
    bio: 'Designing warm, editorial interfaces for seed-to-growth technology companies.',
    location: 'Paris, France',
    hourly_rate: 85,
    availability: 'available',
    avatar_url: null,
    skills: ['UI/UX', 'Figma', 'Design Systems', 'Typography'],
    avg_rating: 5.0,
    review_count: 32,
    is_favourite: true,
  }
];

const mockDashboard = {
  role: 'freelancer',
  stats: {
    total_earnings: '24,500',
    total_spent: '0',
    active_bookings: 3,
    pending_bookings: 1,
    total_bookings: 18,
  },
  monthly_earnings: [
    { month: 'Jan', earnings: 3200 },
    { month: 'Feb', earnings: 4100 },
    { month: 'Mar', earnings: 5600 },
    { month: 'Apr', earnings: 4800 },
    { month: 'May', earnings: 6800 },
  ],
  bookings: [
    {
      id: 101,
      start_date: '2026-10-10T00:00:00Z',
      end_date: '2026-11-15T00:00:00Z',
      status: 'accepted',
      client: { id: 2, full_name: 'Venture Studio X', username: 'venture' },
      freelancer: { id: 1, full_name: 'Alex Rivera', username: 'alex' },
      invoice: { id: 201, amount: 4500, status: 'paid' }
    }
  ],
  reviews: [
    { id: 1, reviewer: 'Studio Chief', rating: 5, comment: 'Phenomenal attention to detail and craft.' }
  ],
  favourites: []
};

async function setupApiMocks(page, { loggedIn = false, isStaff = false } = {}) {
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/me/')) {
      if (loggedIn) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...mockUser, is_staff: isStaff }),
        });
      } else {
        return route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Unauthenticated' }) });
      }
    }
    if (url.includes('/freelancers/1/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFreelancers[0]),
      });
    }
    if (url.includes('/freelancers/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: mockFreelancers, total: 2, count: 2, num_pages: 1, current_page: 1 }),
      });
    }
    if (url.includes('/dashboard/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboard),
      });
    }
    if (url.includes('/profile/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFreelancers[0]),
      });
    }
    if (url.includes('/messages/alex/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          other_user: mockFreelancers[0],
          messages: [
            { id: 1, sender: 'alex', body: 'Greetings! How can I assist with your project roadmap?', created_at: new Date().toISOString() },
            { id: 2, sender: 'client', body: 'We are looking to develop a custom React architecture.', created_at: new Date().toISOString() },
          ],
        }),
      });
    }
    if (url.includes('/messages/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          threads: [
            { username: 'alex', full_name: 'Alex Rivera', unread_count: 1, last_message: 'Greetings! How can I assist...', last_message_at: new Date().toISOString() }
          ]
        }),
      });
    }
    if (url.includes('/notifications/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            { id: 1, verb: 'New Booking Contract', description: 'Milestone escrow contract created for React 19 Project', is_read: false, created_at: new Date().toISOString(), notification_type: 'booking' }
          ],
          unread_count: 1
        }),
      });
    }
    if (url.includes('/bookings/1/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          start_date: '2026-10-15T00:00:00Z',
          end_date: '2026-11-20T00:00:00Z',
          description: 'Design and implementation of bespoke design tokens and state management.',
          status: 'pending',
          client: { id: 2, username: 'elena', full_name: 'Elena Rostova' },
          freelancer: { id: 1, username: 'alex', full_name: 'Alex Rivera' }
        }),
      });
    }
    if (url.includes('/admin/stats/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { users: 1420, freelancers: 380, bookings: 890, revenue: '142,500' },
          recent_bookings: [
            { id: 101, client: { username: 'elena' }, freelancer: { username: 'alex' }, status: 'accepted' }
          ],
          users: [
            { id: 1, username: 'alex', role: 'freelancer', is_staff: true, date_joined: new Date().toISOString() }
          ]
        }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });
}

test.describe('Responsive Viewports Test Suite', () => {
  for (const vp of viewports) {
    test(`Home page has no horizontal overflow & responsive navbar at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupApiMocks(page, { loggedIn: false });
      await page.goto('http://127.0.0.1:5173/');

      await page.waitForSelector('.botanical-hero-section');

      // Check if page overflows horizontally
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(isOverflowing).toBe(false);

      if (vp.width <= 992) {
        const hamburger = page.locator('.mobile-hamburger-btn');
        await expect(hamburger).toBeVisible();

        // Open drawer
        await hamburger.click();
        const drawer = page.locator('.mobile-nav-drawer');
        await expect(drawer).toHaveClass(/is-open/);

        // Click Explore Talent link to close
        const exploreLink = drawer.locator('a', { hasText: 'Explore Talent' });
        await exploreLink.click();
        await expect(drawer).not.toHaveClass(/is-open/);
      } else {
        const desktopLinks = page.locator('.navbar-links');
        await expect(desktopLinks).toBeVisible();
      }
    });

    test(`Talent detail page has no horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupApiMocks(page, { loggedIn: false });
      await page.goto('http://127.0.0.1:5173/freelancer/1');

      await page.waitForSelector('.profile-hero-dark');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(isOverflowing).toBe(false);
    });

    test(`Dashboard page has no horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupApiMocks(page, { loggedIn: true });
      await page.goto('http://127.0.0.1:5173/dashboard');

      await page.waitForSelector('.dashboard-page');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(isOverflowing).toBe(false);
    });

    test(`Messages chat view has no horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupApiMocks(page, { loggedIn: true });
      await page.goto('http://127.0.0.1:5173/messages/alex');

      await page.waitForSelector('.chat-header');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(isOverflowing).toBe(false);
    });

    test(`Login page has no horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupApiMocks(page, { loggedIn: false });
      await page.goto('http://127.0.0.1:5173/login');

      await page.waitForSelector('.auth-card');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(isOverflowing).toBe(false);
    });

    test(`Signup page has no horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupApiMocks(page, { loggedIn: false });
      await page.goto('http://127.0.0.1:5173/signup');

      await page.waitForSelector('.auth-card');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(isOverflowing).toBe(false);
    });
  }
});
