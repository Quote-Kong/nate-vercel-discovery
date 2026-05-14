import React, { useState, useEffect } from 'react';

export interface TestimonialsConfigListProps {
  companyId: number;
}

export interface TestimonialData {
  TestimonialID: number;
  ClientName: string;
  Quote: string;
  Rating: number;
}

const TestimonialsConfigList: React.FC<TestimonialsConfigListProps> = ({ companyId }) => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newClientName, setNewClientName] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [newRating, setNewRating] = useState(5);
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
    if (!newClientName.trim() || !newQuote.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/discovery-config/${companyId}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ClientName: newClientName.trim(), 
          Quote: newQuote.trim(), 
          Rating: newRating 
        })
      });
      const newTestimonial = await response.json();
      setTestimonials([...testimonials, newTestimonial]);
      setNewClientName('');
      setNewQuote('');
      setNewRating(5);
    } catch (error) {
      console.error("Failed to add testimonial", error);
    } finally {
      setIsAdding(false);
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

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse text-sm">Loading testimonials...</div>;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Client Testimonials</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage reviews displayed in the Lead Magnet flow.</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex flex-col gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newClientName}
              onChange={e => setNewClientName(e.target.value)}
              placeholder="Client Name (e.g., Sarah M.)"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400 font-medium">Rating:</label>
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className={`text-xl focus:outline-none ${star <= newRating ? 'text-yellow-400' : 'text-slate-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={newQuote}
              onChange={e => setNewQuote(e.target.value)}
              placeholder="Testimonial Quote"
              className="md:col-span-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newClientName.trim() || !newQuote.trim()}
            className="self-end px-5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded cursor-pointer disabled:bg-blue-400"
          >
            {isAdding ? 'Adding...' : 'Add Testimonial'}
          </button>
        </form>

        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">No testimonials configured.</div>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial.TestimonialID} className="flex flex-col sm:flex-row gap-4 justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{testimonial.ClientName}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => handleUpdateRating(testimonial.TestimonialID, star)}
                          className={`text-lg transition-colors cursor-pointer focus:outline-none ${star <= testimonial.Rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{testimonial.Quote}"</p>
                </div>
                <button
                  onClick={() => handleDelete(testimonial.TestimonialID)}
                  className="self-start px-3 py-1.5 text-red-600 hover:bg-red-50 text-sm font-semibold rounded transition-colors cursor-pointer whitespace-nowrap"
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

export default TestimonialsConfigList;
