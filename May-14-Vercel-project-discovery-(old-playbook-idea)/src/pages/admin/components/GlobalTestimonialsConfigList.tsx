import React, { useState, useEffect } from 'react';

export interface GlobalTestimonialsConfigListProps {
  companyId: number;
}

export interface TestimonialData {
  TestimonialID: number;
  ClientName: string;
  Quote: string;
  Rating: number;
}

const GlobalTestimonialsConfigList: React.FC<GlobalTestimonialsConfigListProps> = ({ companyId }) => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [clientName, setClientName] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/discovery-config/${companyId}/testimonials`);
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error("Failed to load testimonials", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !quote.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/discovery-config/${companyId}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ClientName: clientName.trim(),
          Quote: quote.trim(),
          Rating: rating
        })
      });
      const newTestimonial = await response.json();
      setTestimonials([...testimonials, newTestimonial]);
      setClientName('');
      setQuote('');
      setRating(5);
    } catch (error) {
      console.error("Failed to add testimonial", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/discovery-config/${companyId}/testimonials/${id}`, {
        method: 'DELETE'
      });
      setTestimonials(testimonials.filter(t => t.TestimonialID !== id));
    } catch (error) {
      console.error("Failed to delete testimonial", error);
    }
  };

  const handleUpdateRating = async (id: number, newRatingValue: number) => {
    try {
      setTestimonials(testimonials.map(t => 
        t.TestimonialID === id ? { ...t, Rating: newRatingValue } : t
      ));
      await fetch(`/api/admin/discovery-config/${companyId}/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Rating: newRatingValue })
      });
    } catch (error) {
      console.error("Failed to update rating", error);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse text-sm">Loading testimonials...</div>;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Client Testimonials</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Add reviews to build trust with your clients during the discovery process.</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex flex-col gap-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g., Sarah M."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl cursor-pointer transition-colors focus:outline-none ${star <= rating ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quote / Review text</label>
            <textarea
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder="e.g., They transformed our kitchen perfectly!"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={2}
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isAdding || !clientName.trim() || !quote.trim()}
              className="px-5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded cursor-pointer disabled:bg-blue-400"
            >
              {isAdding ? 'Adding...' : 'Add Testimonial'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">No testimonials configured. Add one above.</div>
          ) : (
            testimonials.map((t) => (
              <div key={t.TestimonialID} className="flex flex-col sm:flex-row gap-4 justify-between items-start p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleUpdateRating(t.TestimonialID, star)}
                        className={`text-xl cursor-pointer transition-colors focus:outline-none ${star <= (t.Rating || 5) ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                        title={`Set rating to ${star}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 italic text-sm mb-2">"{t.Quote}"</p>
                  <p className="text-slate-900 dark:text-slate-50 font-semibold text-sm">— {t.ClientName}</p>
                </div>
                <button
                  onClick={() => handleDelete(t.TestimonialID)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold cursor-pointer shrink-0 mt-2 sm:mt-0"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalTestimonialsConfigList;
