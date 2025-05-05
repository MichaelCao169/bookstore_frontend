import React from 'react';


const SimpleStarRating = ({ rating = 0 }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  return (
    <div className="flex items-center">
      <span className="text-yellow-400 flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.421 4.876.709c.85.124 1.188 1.168.576 1.756l-3.528 3.438.834 4.857c.145.845-.738 1.5-1.504 1.1l-4.36-2.292-4.36 2.292c-.766.4-1.649-.255-1.504-1.1l.834-4.857L2.68 9.769c-.612-.588-.274-1.632.576-1.756l4.876-.709L10 2.884Z" clipRule="evenodd" /></svg>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300 dark:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.31h5.418a.563.563 0 0 1 .372.956l-4.386 3.114a.563.563 0 0 0-.182.635l1.658 5.281a.563.563 0 0 1-.812.622l-4.39-3.135a.563.563 0 0 0-.576 0l-4.39 3.135a.563.563 0 0 1-.812-.622l1.658-5.281a.563.563 0 0 0-.182-.635L2.47 9.881a.562.562 0 0 1 .372-.956h5.418a.563.563 0 0 0 .475-.31L11.48 3.5Z" /></svg>
        ))}
      </span>
    </div>
  );
}


const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  } catch (error) {
    console.error("Error formatting date:", error);
    return isoString;
  }
}

const ReviewItem = ({ review }) => {
  if (!review) return null;

  return (
    <article className="py-4 border-b dark:border-gray-700 last:border-b-0">
      <div className="flex items-start mb-2 space-x-3 rtl:space-x-reverse">

        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
          {review.userName?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
            {review.userName || 'Anonymous'}
          </p>

        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(review.createdAt)}
        </div>
      </div>
      <div className="flex items-center mb-1 space-x-1 rtl:space-x-reverse">
        <SimpleStarRating rating={review.rating} />

      </div>
      <p className="text-sm text-gray-600 dark:text-dark-text-secondary whitespace-pre-wrap text-left">
        {review.comment || ''}
      </p>
    </article>
  );
};

export default ReviewItem;