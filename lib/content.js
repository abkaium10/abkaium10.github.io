import { PROFILE, STATS, EXPERIENCE, TESTIMONIALS, LEVELS, ESTIMATE } from './profile';
export { PROFILE, STATS, EXPERIENCE, TESTIMONIALS, LEVELS, ESTIMATE };
export const ROLES = ['Full Stack Developer', 'Next.js Engineer', 'API and Database Architect'];
export const SERVICES = [
  { t: 'Full Stack Development', d: 'Complete products from database to UI: authentication, dashboards, payments and automated deployments.', stack: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Prisma', 'Docker', 'GitHub Actions'] },
  { t: 'Next.js Engineering', d: 'App Router, Server Components and Server Actions with strict TypeScript, tuned for Core Web Vitals and SEO.', stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Auth.js', 'TanStack Query', 'Zustand', 'Playwright', 'Vitest', 'Vercel'] },
  { t: 'API and Database Architecture', d: 'REST and GraphQL APIs with secure auth, carefully modelled schemas, indexing, caching and background jobs.', stack: ['REST', 'GraphQL', 'tRPC', 'OpenAPI', 'JWT', 'OAuth 2.0', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Nginx'] },
];
export const SKILLS = {
  'Frontend': ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'Zustand', 'TanStack Query', 'Framer Motion', 'Vite'],
  'Backend & Database': ['Node.js', 'Express', 'NestJS', 'PostgreSQL', 'MySQL', 'MongoDB', 'Prisma', 'Redis', 'Supabase', 'Firebase', 'Python'],
  'API & Architecture': ['REST', 'GraphQL', 'tRPC', 'OpenAPI', 'WebSockets', 'JWT', 'OAuth 2.0', 'Auth.js', 'Zod', 'RabbitMQ', 'Microservices'],
  'Testing & DevOps': ['Jest', 'Vitest', 'Playwright', 'Cypress', 'Docker', 'GitHub Actions', 'Nginx', 'AWS', 'Linux'],
  'Tools & Platforms': ['Git', 'GitHub', 'VS Code', 'Vercel', 'Postman', 'Figma', 'Storybook'],
};
export const PROCESS = [
  { t: 'Discover', d: 'We define goals, users and scope before a single line of code.' },
  { t: 'Design', d: 'Wireframes and a clear visual direction you can react to early.' },
  { t: 'Build', d: 'Clean, tested code shipped in small steps you can follow.' },
  { t: 'Launch', d: 'Deployment, monitoring and support after go-live.' },
];
export const CODE = [
  { f: 'actions.ts', c: `'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

const Schema = z.object({
  title: z.string().min(2),
  url: z.string().url(),
});

export async function createProject(formData: FormData) {
  const data = Schema.parse(Object.fromEntries(formData));
  await prisma.project.create({ data });
  revalidatePath('/projects');
}` },
  { f: 'orders.js', c: `router.get('/orders', requireAuth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const take = 20;
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * take,
    take,
  });
  res.json({ page, data: orders });
});` },
  { f: 'schema.prisma', c: `model Order {
  id        Int      @id @default(autoincrement())
  userId    Int
  total     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
}` },
  { f: 'cache.js', c: `export async function getProduct(id) {
  const key = 'product:' + id;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);

  const product = await prisma.product.findUnique({ where: { id } });
  await redis.set(key, JSON.stringify(product), { EX: 300 });
  return product;
}` },
];
export const BN = {
  'About': 'পরিচিতি', 'Skills': 'দক্ষতা', 'Projects': 'প্রজেক্ট', 'Experience': 'অভিজ্ঞতা', 'Contact': 'যোগাযোগ',
  'I am a': 'আমি একজন', 'Open to new projects': 'নতুন প্রজেক্টের জন্য উপলব্ধ', 'View my work': 'আমার কাজ দেখুন', 'Download CV': 'সিভি ডাউনলোড',
  'Years building': 'বছরের অভিজ্ঞতা', 'Projects shipped': 'সম্পন্ন প্রজেক্ট', 'Happy clients': 'সন্তুষ্ট ক্লায়েন্ট',
  'What I do': 'আমি যা করি', 'How I work': 'আমার কাজের ধাপ', 'Skill levels': 'দক্ষতার মাত্রা',
  'Frontend': 'ফ্রন্টএন্ড', 'Backend & Database': 'ব্যাকএন্ড ও ডাটাবেস', 'API & Architecture': 'এপিআই ও আর্কিটেকচার', 'Testing & DevOps': 'টেস্টিং ও ডেভঅপ্স', 'Tools & Platforms': 'টুলস ও প্ল্যাটফর্ম',
  'Backend': 'ব্যাকএন্ড', 'Databases': 'ডাটাবেস', 'APIs': 'এপিআই', 'DevOps': 'ডেভঅপ্স', 'Testing': 'টেস্টিং',
  'Code I write': 'আমি যেমন কোড লিখি', 'Example patterns for the stack I work with. Click a tab to switch, or copy the snippet.': 'আমার স্ট্যাকের জন্য উদাহরণ কোড প্যাটার্ন। ট্যাব বদলান বা কোড কপি করুন।', 'Message': 'বার্তা', 'Subject (optional)': 'বিষয় (ঐচ্ছিক)', 'Copy email': 'ইমেইল কপি করুন',
  'Selected projects': 'নির্বাচিত প্রজেক্ট', 'Search projects': 'প্রজেক্ট খুঁজুন', 'All': 'সব', 'Details': 'বিস্তারিত', 'Case study': 'কেস স্টাডি', 'Navigate': 'নেভিগেট', 'Search': 'খুঁজুন', 'Connect': 'যোগাযোগ', 'Quick view': 'দ্রুত দেখুন', 'Featured': 'বিশেষ', 'Under the hood': 'ভেতরের কথা', 'Technologies used across my projects': 'আমার প্রজেক্টে ব্যবহৃত প্রযুক্তি', 'Search articles': 'প্রবন্ধ খুঁজুন', 'Load more': 'আরও দেখুন', 'Reset filters': 'ফিল্টার রিসেট', 'Copy': 'কপি', 'Related articles': 'সম্পর্কিত লেখা', 'Share': 'শেয়ার', 'Next post': 'পরের লেখা',  'Live site': 'লাইভ সাইট',
  'Writing': 'লেখালেখি', 'Open source': 'ওপেন সোর্স', 'Kind words': 'ক্লায়েন্টদের কথা', 'Ask my terminal': 'আমার টার্মিনালকে জিজ্ঞেস করুন',
  'Try help, skills or sudo hire-me. Press Ctrl+K anywhere for the command palette.': 'help, skills বা sudo hire-me লিখে দেখুন। যেকোনো জায়গায় Ctrl+K চেপে কমান্ড প্যালেট খুলুন।',
  'Have a project in mind?': 'মাথায় কোনো প্রজেক্ট আছে?', 'Send a message and I will get back to you.': 'একটি বার্তা পাঠান, আমি আপনার সাথে যোগাযোগ করব।',
  'Your name': 'আপনার নাম', 'Your email': 'আপনার ইমেইল', 'Tell me about your project': 'আপনার প্রজেক্ট সম্পর্কে বলুন', 'Send message': 'বার্তা পাঠান',
  'Email': 'ইমেইল', 'Close': 'বন্ধ করুন', 'Skip to content': 'মূল অংশে যান',
};
const _B = [
  { t: 'ফুল স্ট্যাক ডেভেলপমেন্ট', d: 'ডাটাবেস থেকে UI পর্যন্ত সম্পূর্ণ প্রোডাক্ট: অথেনটিকেশন, ড্যাশবোর্ড, পেমেন্ট ও স্বয়ংক্রিয় ডিপ্লয়মেন্ট।' },
  { t: 'Next.js ইঞ্জিনিয়ারিং', d: 'App Router, Server Components ও Server Actions, কঠোর TypeScript সহ, Core Web Vitals ও SEO-র জন্য অপ্টিমাইজড।' },
  { t: 'এপিআই ও ডাটাবেস আর্কিটেকচার', d: 'নিরাপদ অথ, সুচিন্তিত স্কিমা, ইনডেক্সিং, ক্যাশিং ও ব্যাকগ্রাউন্ড জব সহ REST ও GraphQL এপিআই।' },
];
SERVICES.forEach((s, i) => { s.bn = _B[i]; });
[['আবিষ্কার', 'কোড লেখার আগেই লক্ষ্য, ব্যবহারকারী ও পরিধি ঠিক করি।'], ['ডিজাইন', 'ওয়্যারফ্রেম ও পরিষ্কার ভিজ্যুয়াল দিকনির্দেশনা, যাতে শুরুতেই মতামত দিতে পারেন।'], ['নির্মাণ', 'পরিষ্কার ও পরীক্ষিত কোড, ছোট ছোট ধাপে ডেলিভারি।'], ['লঞ্চ', 'ডিপ্লয়মেন্ট, মনিটরিং এবং লাইভ হওয়ার পরের সাপোর্ট।']].forEach(([t, d], i) => { PROCESS[i].bn = { t, d }; });
PROFILE.bn = { bio: 'আমি Next.js, Node.js ও PostgreSQL দিয়ে দ্রুত ও সহজে ব্যবহারযোগ্য ওয়েব প্রোডাক্ট তৈরি করি, প্রথম ডাটাবেস স্কিমা থেকে ইন্টারফেসের শেষ পিক্সেল পর্যন্ত।' };
