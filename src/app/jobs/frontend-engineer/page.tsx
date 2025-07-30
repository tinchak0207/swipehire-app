import type { Metadata } from 'next';
import { generateJobCategoryMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateFAQSchema, stringifySchema } from '@/lib/seo/schemas';
import FrontendEngineerJobsPage from './FrontendEngineerJobsPageClient';

// SEO Metadata for Frontend Engineer Jobs
export const metadata: Metadata = generateJobCategoryMetadata({
  skill: '前端工程師',
  location: '台灣',
  jobCount: 124,
  averageSalary: { min: 60000, max: 120000 },
});

// FAQ data for structured data
const faqs = [
  {
    question: '前端工程師的平均薪資是多少？',
    answer:
      '前端工程師的平均薪資依經驗而定：新鮮人45-65萬年薪，有經驗的前端工程師可達90-140萬年薪，資深前端工程師年薪可達140-250萬。',
  },
  {
    question: '前端工程師需要具備哪些技能？',
    answer:
      '前端工程師需要掌握HTML5、CSS3、JavaScript、React或Vue.js框架、響應式設計(RWD)、版本控制Git等技能。TypeScript和UI/UX設計理解也是加分項目。',
  },
  {
    question: '台北有多少前端工程師職缺？',
    answer:
      '目前台北地區有45個前端工程師職缺開放中，涵蓋各種經驗層級，從新鮮人到資深工程師都有合適的機會。',
  },
  {
    question: '如何提升前端工程師面試成功率？',
    answer:
      '建議完善GitHub作品集、練習技術面試題目、了解目標公司技術棧、準備具體專案經驗分享，並使用SwipeHire的AI履歷優化工具提升履歷通過率。',
  },
];

const breadcrumbs = [
  { name: '首頁', url: 'https://swipehire.top' },
  { name: '工作機會', url: 'https://swipehire.top/jobs' },
  { name: '前端工程師職缺', url: 'https://swipehire.top/jobs/frontend-engineer' },
];

export default function FrontendEngineerJobsPageWrapper() {
  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifySchema(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifySchema(breadcrumbSchema),
        }}
      />

      {/* Page Content */}
      <FrontendEngineerJobsPage />
    </>
  );
}
