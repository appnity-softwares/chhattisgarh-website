import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const findImageHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';

export const testimonials = [
  {
    name: 'Priya & Rohan',
    location: 'Raipur, CG',
    text: 'We found our perfect match on Chhattisgarh Bandhan. The platform is so easy to use and truly understands our culture. Highly recommended!',
    avatar: findImage('testimonial-2'),
    avatarHint: findImageHint('testimonial-2'),
  },
  {
    name: 'Anjali Sharma',
    location: 'Bilaspur, CG',
    text: 'Finding someone from my own community was very important to me. This app made it possible. Thank you to the team for creating such a wonderful service.',
    avatar: findImage('testimonial-1'),
    avatarHint: findImageHint('testimonial-1'),
  },
  {
    name: 'Vikram Singh',
    location: 'Durg, CG',
    text: 'I was skeptical about online matrimony, but Chhattisgarh Bandhan changed my mind. The profiles are genuine, and the AI suggestions were surprisingly accurate.',
    avatar: findImage('testimonial-3'),
    avatarHint: findImageHint('testimonial-3'),
  },
];

export const mockProfiles = [
  {
    id: '1',
    name: 'Sunita Verma',
    age: 28,
    height: "5' 4\"",
    religion: 'Hindu, Kurmi',
    category: 'OBC',
    nativeVillage: 'Selud',
    location: 'Bhilai, CG',
    education: 'M.Sc. Chemistry',
    occupation: 'Teacher',
    bio: 'Simple, caring person looking for a partner with similar values. I enjoy reading and spending time with my family.',
    avatar: findImage('user-avatar-1'),
    avatarHint: findImageHint('user-avatar-1'),
  },
  {
    id: '2',
    name: 'Amit Kumar',
    age: 32,
    height: "5' 9\"",
    religion: 'Hindu, Sahu',
    category: 'OBC',
    nativeVillage: 'Abhanpur',
    location: 'Raipur, CG',
    education: 'B.Tech CSE',
    occupation: 'Software Engineer',
    bio: 'Ambitious and fun-loving. I work in Bangalore but my roots are in Chhattisgarh. Looking for an understanding and supportive partner.',
    avatar: findImage('user-avatar-2'),
    avatarHint: findImageHint('user-avatar-2'),
  },
  {
    id: '3',
    name: 'Kavita Sahu',
    age: 29,
    height: "5' 6\"",
    religion: 'Hindu, Sahu',
    location: 'Rajnandgaon, CG',
    education: 'MBA',
    occupation: 'Bank Manager',
    bio: 'A blend of modern and traditional values. I believe in mutual respect and partnership in marriage. My hobbies include painting and traveling.',
    avatar: findImage('user-avatar-3'),
    avatarHint: findImageHint('user-avatar-3'),
  },
  {
    id: '4',
    name: 'Rajesh Patel',
    age: 34,
    height: "5' 8\"",
    religion: 'Hindu, Patel',
    category: 'General',
    nativeVillage: 'Katghora',
    location: 'Korba, CG',
    education: 'M.Com',
    occupation: 'Businessman',
    bio: 'Family-oriented and hardworking. I run my family business. In my free time, I like to play cricket and watch movies.',
    avatar: findImage('user-avatar-4'),
    avatarHint: findImageHint('user-avatar-4'),
  },
];

export const mockCurrentUser = {
  id: 'current-user',
  name: 'Anjali Sharma',
  email: 'anjali.sharma@example.com',
  avatar: findImage('testimonial-1'),
  avatarHint: findImageHint('testimonial-1'),
  profile: {
    ...mockProfiles[2],
    id: '3',
    name: 'Kavita Sahu',
    age: 29,
    height: "5' 6\"",
    religion: 'Hindu, Sahu',
    location: 'Rajnandgaon, CG',
    education: 'MBA',
    occupation: 'Bank Manager',
    bio: 'A blend of modern and traditional values. I believe in mutual respect and partnership in marriage. My hobbies include painting and traveling.',
    avatar: findImage('user-avatar-3'),
    avatarHint: findImageHint('user-avatar-3'),
    motherTongue: 'Chhattisgarhi',
    category: 'OBC',
    nativeVillage: 'Dongargaon',
    caste: 'Sahu',
    partnerPreferences: 'Looking for a well-educated professional from a similar background. Should be family-oriented and respect elders. Non-smoker and teetotaler preferred.',
  }
};



export const adminNavItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/activity', label: 'Activity Log' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/profiles', label: 'Profiles' },
  { href: '/admin/verifications', label: 'Verifications' },
  { href: '/admin/agents', label: 'Agents' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/faqs', label: 'FAQs' },
  { href: '/admin/settings', label: 'Settings' },
];
