'use client';

import {
  Building,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: { min: number; max: number };
  type: string;
  skills: string[];
  posted: string;
  companyLogo?: string;
  featured?: boolean;
}

// Mock data for demonstration
const mockJobs: JobListing[] = [
  {
    id: '1',
    title: 'Senior 前端工程師',
    company: 'TechCorp Taiwan',
    location: '台北市信義區',
    salary: { min: 80, max: 120 },
    type: '全職',
    skills: ['React', 'TypeScript', 'Next.js'],
    posted: '2天前',
    featured: true,
  },
  {
    id: '2',
    title: '前端工程師 (React)',
    company: 'StartupXYZ',
    location: '新竹科學園區',
    salary: { min: 60, max: 90 },
    type: '全職',
    skills: ['React', 'JavaScript', 'CSS'],
    posted: '1週前',
  },
  {
    id: '3',
    title: 'Junior 前端開發者',
    company: 'Digital Agency',
    location: '台中市西區',
    salary: { min: 45, max: 65 },
    type: '全職',
    skills: ['Vue.js', 'HTML5', 'SCSS'],
    posted: '3天前',
  },
];

const salaryRanges = [
  { label: '40K-60K', count: 28 },
  { label: '60K-80K', count: 45 },
  { label: '80K-100K', count: 32 },
  { label: '100K+', count: 19 },
];

const popularSkills = [
  { name: 'React', demand: '95%', jobs: 124 },
  { name: 'Vue.js', demand: '78%', jobs: 89 },
  { name: 'Angular', demand: '65%', jobs: 67 },
  { name: 'TypeScript', demand: '88%', jobs: 98 },
  { name: 'Next.js', demand: '72%', jobs: 76 },
  { name: 'CSS3', demand: '92%', jobs: 115 },
];

const topCompanies = [
  { name: 'TSMC', openings: 12, rating: 4.5 },
  { name: 'MediaTek', openings: 8, rating: 4.3 },
  { name: 'Trend Micro', openings: 6, rating: 4.4 },
  { name: 'HTC', openings: 4, rating: 4.2 },
];

export default function FrontendEngineerJobsPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              前端工程師職缺
              <span className="block text-xl md:text-2xl font-normal mt-2 text-blue-100">
                2024年最新工作機會 - 共124個職位
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              發現台灣最優質的前端工程師職缺，薪資透明、福利優渥。
              從新創到大企業，找到最適合你的前端開發工作。
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="搜尋前端職位..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-0 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="地點"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="pl-10 h-12 border-0 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700">
                  搜尋職缺
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
            <div>
              <div className="text-3xl font-bold">124</div>
              <div className="text-blue-100">開放職缺</div>
            </div>
            <div>
              <div className="text-3xl font-bold">85K</div>
              <div className="text-blue-100">平均薪資</div>
            </div>
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-blue-100">遠距友善</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.2</div>
              <div className="text-blue-100">雇主評分</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Salary Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    薪資範圍
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {salaryRanges.map((range) => (
                    <div key={range.label} className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" className="mr-2" />
                        <span>{range.label}</span>
                      </label>
                      <Badge variant="secondary">{range.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    熱門公司
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topCompanies.map((company) => (
                    <div key={company.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {company.rating}
                        </div>
                      </div>
                      <Badge>{company.openings}個職缺</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Location Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>熱門地區前端工程師職缺</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    href="/jobs/frontend-engineer/taipei"
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-medium">台北</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">45個</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                  <Link
                    href="/jobs/frontend-engineer/hsinchu"
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <span className="font-medium">新竹</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">32個</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                  <Link
                    href="/jobs/frontend-engineer/taichung"
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <span className="font-medium">台中</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">28個</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                  <Link
                    href="/jobs/frontend-engineer/remote"
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <span className="font-medium">遠距</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">19個</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Featured Jobs */}
            <div>
              <h2 className="text-2xl font-bold mb-6">精選前端工程師職缺</h2>
              <div className="space-y-4">
                {mockJobs.map((job) => (
                  <Card
                    key={job.id}
                    className={`hover:shadow-lg transition-shadow ${job.featured ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              {job.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800">精選</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{job.company}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {job.salary.min}K - {job.salary.max}K
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.posted}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill) => (
                                <Badge key={skill} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          查看詳情
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button size="lg" variant="outline">
                  載入更多職缺
                </Button>
              </div>
            </div>

            {/* Skills Demand */}
            <Card>
              <CardHeader>
                <CardTitle>前端技能需求分析</CardTitle>
                <CardDescription>2024年最熱門的前端技術與職缺數量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularSkills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {skill.name.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-sm text-gray-500">{skill.jobs}個職缺</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{skill.demand}</div>
                          <div className="text-xs text-gray-500">需求度</div>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Content */}
            <div className="prose max-w-none">
              <h2>前端工程師職涯發展指南</h2>
              <p>
                前端工程師是目前科技業最熱門的職位之一，平均起薪為60-80萬年薪，
                有經驗的資深前端工程師年薪可達120-200萬。隨著數位轉型趨勢，
                前端工程師的需求持續成長，是絕佳的職涯選擇。
              </p>

              <h3>前端工程師必備技能</h3>
              <ul>
                <li>
                  <strong>核心技術</strong>：HTML5, CSS3, JavaScript (ES6+)
                </li>
                <li>
                  <strong>框架經驗</strong>：React.js, Vue.js, 或 Angular
                </li>
                <li>
                  <strong>開發工具</strong>：Webpack, Vite, Git 版本控制
                </li>
                <li>
                  <strong>響應式設計</strong>：RWD, Mobile-first 設計概念
                </li>
                <li>
                  <strong>TypeScript</strong>：型別安全的 JavaScript 超集
                </li>
                <li>
                  <strong>UI/UX 理解</strong>：設計系統、使用者體驗概念
                </li>
              </ul>

              <h3>2024年前端工程師薪資行情</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        經驗年資
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        薪資範圍 (年薪)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        主要技能要求
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        新鮮人 (0-1年)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">45-65萬</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        HTML, CSS, JavaScript, React基礎
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        初級 (1-3年)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">65-90萬</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        React/Vue, TypeScript, RWD
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        中級 (3-5年)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        90-140萬
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        架構設計, 效能優化, 團隊協作
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        資深 (5年以上)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        140-250萬
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        技術領導, 系統架構, 跨團隊溝通
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>如何透過SwipeHire找到理想前端工作</h3>
              <ol>
                <li>
                  <strong>完善履歷</strong>：使用我們的AI履歷優化工具，提升履歷通過率
                </li>
                <li>
                  <strong>技能媒合</strong>：平台會根據你的技能自動推薦適合的職缺
                </li>
                <li>
                  <strong>薪資透明</strong>：所有職缺都顯示薪資範圍，不浪費時間
                </li>
                <li>
                  <strong>即時通知</strong>：新職缺發布時立即收到通知，搶得先機
                </li>
              </ol>

              <Separator className="my-8" />

              <div className="text-center">
                <h3>準備好開始你的前端工程師職涯了嗎？</h3>
                <p className="text-lg text-gray-600 mb-6">
                  立即註冊SwipeHire，獲得個人化的職缺推薦與AI履歷優化服務
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    免費註冊求職
                  </Button>
                  <Button size="lg" variant="outline">
                    了解更多服務
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
