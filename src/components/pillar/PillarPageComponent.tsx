import { ArrowRight, BookOpen, Clock, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ClusterArticle, PillarPage } from '@/lib/pillar-content-strategy';

interface PillarPageProps {
  pillar: PillarPage;
  relatedTools?: Array<{
    name: string;
    description: string;
    url: string;
    icon?: React.ReactNode;
  }>;
}

export const PillarPageComponent: React.FC<PillarPageProps> = ({ pillar, relatedTools = [] }) => {
  const featuredArticles = pillar.clusterArticles.filter((article) => article.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            <BookOpen className="mr-2 h-4 w-4" />
            Complete Guide
          </Badge>

          <h1 className="mb-6 font-bold text-4xl tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {pillar.title}
          </h1>

          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 leading-relaxed">
            {pillar.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{pillar.readingTime} min read</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>{pillar.searchVolume.toLocaleString()} monthly searches</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{pillar.clusterArticles.length} expert guides</span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <BookOpen className="mr-2 h-5 w-5" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {pillar.clusterArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="flex items-start gap-3 rounded-lg p-3 text-blue-800 transition-colors hover:bg-blue-100"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium">{article.title}</h4>
                      <p className="text-sm text-blue-600">{article.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mx-auto mt-16 max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 font-bold text-3xl text-gray-900">
                Start Here: Essential Guides
              </h2>
              <p className="text-gray-600">
                These comprehensive guides form the foundation of your knowledge in this area.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
          </section>
        )}

        {/* All Articles by Category */}
        <section className="mx-auto mt-16 max-w-6xl">
          <h2 className="mb-8 text-center font-bold text-3xl text-gray-900">
            Complete Learning Path
          </h2>

          {/* Group articles by category */}
          {Object.entries(
            pillar.clusterArticles.reduce(
              (acc, article) => {
                const category = article.category || 'Uncategorized';
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(article);
                return acc;
              },
              {} as Record<string, ClusterArticle[]>
            )
          ).map(([category, articles]) => (
            <div key={category} className="mb-12">
              <h3 className="mb-6 font-semibold text-2xl text-gray-800">{category}</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <section className="mx-auto mt-16 max-w-6xl">
            <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
              <div className="text-center">
                <h2 className="mb-4 font-bold text-3xl">Supercharge Your Progress</h2>
                <p className="mb-8 text-xl opacity-90">
                  Use our AI-powered tools to apply what you've learned and accelerate your career
                  growth.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedTools.map((tool) => (
                  <Card key={tool.name} className="border-0 bg-white/10 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        {tool.icon}
                        <CardTitle className="text-white">{tool.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-white/90">
                        {tool.description}
                      </CardDescription>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={tool.url}>
                          Try Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mx-auto mt-16 max-w-4xl text-center">
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-12">
              <h3 className="mb-4 font-bold text-2xl text-gray-900">Ready to Take Action?</h3>
              <p className="mb-8 text-gray-600">
                Join thousands of tech professionals who have accelerated their careers with
                SwipeHire.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/resume-optimizer">
                    Optimize Your Resume <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

// Article Card Component
interface ArticleCardProps {
  article: ClusterArticle;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  return (
    <Card
      className={`h-full transition-all duration-200 hover:shadow-lg ${featured ? 'border-2 border-blue-200 bg-blue-50/30' : ''}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant={featured ? 'default' : 'secondary'} className="text-xs">
            {article.category}
          </Badge>
          {featured && (
            <Badge variant="destructive" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-lg">
          <Link href={`/blog/${article.slug}`} className="hover:text-blue-600">
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">{article.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {article.readingTime} min
            </span>
            <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap gap-1">
          {article.keywords.slice(0, 3).map((keyword) => (
            <Badge key={keyword} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>

        <Button asChild variant="ghost" className="mt-4 w-full justify-start p-0">
          <Link href={`/blog/${article.slug}`}>
            Read Article <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PillarPageComponent;
