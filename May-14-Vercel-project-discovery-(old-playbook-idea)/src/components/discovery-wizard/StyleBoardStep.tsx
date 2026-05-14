import React, { useState, useRef } from 'react';

export interface PhotoData {
  CompanyDiscoveryPhotoID: number;
  PhotoURL: string;
}

export interface Annotation {
  id: string; // Temp ID for React rendering
  photoId: number;
  coordX: number; // Percentage
  coordY: number; // Percentage
  note: string;
}

export interface StyleBoardStepProps {
  photos: PhotoData[];
  onFinish: (annotations: Annotation[]) => void;
  onBack: () => void;
}

const StyleBoardStep: React.FC<StyleBoardStepProps> = ({ photos, onFinish, onBack }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const currentPhoto = photos[currentPhotoIndex];

  // Required to allow a drop event to occur
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!imageContainerRef.current) return;

    // Get the bounding rectangle of the image container
    const rect = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate raw X/Y relative to the top-left of the image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to percentages so pins stay in place if screen resizes
    const coordX = (x / rect.width) * 100;
    const coordY = (y / rect.height) * 100;

    const newId = `temp-${Date.now()}`;

    const newAnnotation: Annotation = {
      id: newId,
      photoId: currentPhoto.CompanyDiscoveryPhotoID,
      coordX,
      coordY,
      note: '' 
    };

    setAnnotations([...annotations, newAnnotation]);
    setEditingNoteId(newId);
  };

  const handleUpdateNote = (id: string, newNote: string) => {
    setAnnotations(annotations.map(a => a.id === id ? { ...a, note: newNote } : a));
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    if (editingNoteId === id) setEditingNoteId(null);
  };

  const currentPhotoAnnotations = annotations.filter(
    a => a.photoId === currentPhoto?.CompanyDiscoveryPhotoID
  );

  return (
    <div className="flex flex-col md:flex-row max-w-6xl mx-auto md:h-[60vh] gap-6 p-4 animate-in fade-in duration-500">
      
      {/* LEFT COLUMN: The Interactive Image Area */}
      <div className="flex-1 flex flex-col space-y-4">
        
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">What do you like?</h2>
          <p className="text-slate-600 dark:text-slate-400">Drag the "Like" button onto anything that catches your eye.</p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <div 
            draggable 
            className="cursor-grab active:cursor-grabbing bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors"
          >
            👍 Like
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 italic">Drag me onto the photo!</span>
        </div>

        <div 
          ref={imageContainerRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-inner min-h-[300px]"
        >
          {currentPhoto ? (
            <img 
              src={currentPhoto.PhotoURL} 
              alt="Project Example" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">No photos available for this project type.</div>
          )}

          {currentPhotoAnnotations.map((annotation) => (
            <div 
              key={annotation.id}
              className="absolute group transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${annotation.coordX}%`, top: `${annotation.coordY}%` }}
            >
              <button 
                onClick={() => setEditingNoteId(editingNoteId === annotation.id ? null : annotation.id)}
                className="bg-blue-600 dark:bg-blue-500 text-white rounded-full p-2 shadow-lg ring-2 ring-white hover:bg-blue-700 transition-transform hover:scale-110 cursor-pointer"
              >
                👍
              </button>

              {editingNoteId === annotation.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-3 z-10 border border-slate-200 dark:border-slate-700">
                  <textarea 
                    autoFocus
                    value={annotation.note}
                    onChange={(e) => handleUpdateNote(annotation.id, e.target.value)}
                    placeholder="Why do you like this?"
                    className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded resize-none focus:outline-none focus:border-blue-500 dark:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex justify-between mt-2">
                    <button onClick={() => handleDeleteAnnotation(annotation.id)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer">Delete Pin</button>
                    <button onClick={() => setEditingNoteId(null)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:text-blue-200 font-medium cursor-pointer">Close</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button 
            onClick={() => setCurrentPhotoIndex(prev => Math.max(0, prev - 1))}
            disabled={currentPhotoIndex === 0}
            className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-100 dark:bg-slate-800 rounded cursor-pointer"
          >
            ← Previous Photo
          </button>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {currentPhotoIndex + 1} of {photos.length}
          </span>
          <button 
            onClick={() => setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))}
            disabled={currentPhotoIndex === photos.length - 1}
            className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-100 dark:bg-slate-800 rounded cursor-pointer"
          >
            Next Photo →
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: The Notes List */}
      <div className="w-full md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Your Notes</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Items you've liked</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {annotations.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center mt-10">No items liked yet.</p>
          ) : (
            annotations.map(annotation => (
              <div key={annotation.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700 text-sm">
                 <div className="flex justify-between items-start mb-1">
                   <span className="font-semibold text-blue-700 dark:text-blue-300">👍 Liked Item</span>
                   <button onClick={() => handleDeleteAnnotation(annotation.id)} className="text-slate-400 hover:text-red-500 text-xs cursor-pointer">✕</button>
                 </div>
                 <p className="text-slate-600 dark:text-slate-400">
                   {annotation.note ? `"${annotation.note}"` : <span className="italic text-slate-400">No note added.</span>}
                 </p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between bg-white dark:bg-slate-900">
          <button onClick={onBack} className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 cursor-pointer">Back</button>
          <button 
            onClick={() => onFinish(annotations)} 
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition-colors cursor-pointer"
          >
            Finish Survey
          </button>
        </div>
      </div>

    </div>
  );
};

export default StyleBoardStep;
