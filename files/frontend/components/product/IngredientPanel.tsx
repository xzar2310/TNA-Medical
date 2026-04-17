import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';

interface Ingredient {
  name_en: string;
  name_th: string;
  amount: string;
  pubMedUrl?: string;
  description_en?: string;
  description_th?: string;
}

interface IngredientPanelProps {
  ingredients: Ingredient[];
  locale: 'en' | 'th';
}

export default function IngredientPanel({ ingredients, locale }: IngredientPanelProps) {
  const t = useTranslations('Product');

  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-brand-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-display font-semibold text-brand-900">
          {t('ingredients')} - Transparency & Efficacy
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {ingredients.map((ingredient, idx) => {
          const name = locale === 'th' ? ingredient.name_th : ingredient.name_en;
          const desc = locale === 'th' ? ingredient.description_th : ingredient.description_en;
          
          return (
            <div key={idx} className="p-6 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900 text-lg">{name}</span>
                <span className="font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-sm">
                  {ingredient.amount}
                </span>
              </div>
              {desc && (
                <p className="text-sm text-gray-600 mb-3">{desc}</p>
              )}
              {ingredient.pubMedUrl && (
                <a 
                  href={ingredient.pubMedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Clinical Reference (PubMed)
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
