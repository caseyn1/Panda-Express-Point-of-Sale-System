/**
 * StarRating Component
 *
 * @description A modal component that allows users to submit a star rating (1-5). 
 *              After submission, a thank-you message is displayed, and the modal closes automatically.
 *
 * @param {Object} props - The component props.
 * @param {function} props.onClose - Callback function triggered to close the modal.
 * @param {function} props.onSubmit - Callback function triggered with the submitted rating (1-5).
 *
 * @returns {JSX.Element} A modal with interactive stars for rating submission.
 */

import React, { useState, useEffect } from "react";

function StarRating({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0); // User's selected star rating
  const [hover, setHover] = useState(0); // Star currently being hovered over
  const [submitted, setSubmitted] = useState(false); // Submission status

  /**
   * Handles the submission of the selected star rating.
   * If a rating is selected, invokes the onSubmit callback with the rating and sets the submission state.
   */
  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating);
      setSubmitted(true);
    }
  };

  /**
   * Effect to automatically close the modal after a rating is submitted.
   * Triggers a 1.5-second delay before invoking the onClose callback.
   */
  useEffect(() => {
    let timer;
    if (submitted) {
      timer = setTimeout(onClose, 1500);
    }
    return () => clearTimeout(timer);
  }, [submitted, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg text-center w-4/5 max-w-lg shadow-lg relative">
        
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
                &times;
            </button>
            
            {submitted ? (
                <h3 className="text-2xl font-semibold mb-2">Thank you for your feedback!</h3>
            ) : (
                <>
                    {/* Rating Prompt */}
                    <h3 className="text-2xl font-semibold mb-2">Please Rate Your Experience</h3>

                    {/* Star Rating Options */}
                    <div className="flex justify-center mb-6 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`text-7xl transition-colors duration-200 ease-in-out ${
                                    star <= (hover || rating) ? "" : "text-transparent"
                                }`}
                                style={{
                                    color: star <= (hover || rating) ? "#FFD700" : "transparent",
                                    WebkitTextStroke: "1px #FFD700",
                                }}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center space-x-4">
                        <button 
                            onClick={handleSubmit} 
                            className={`py-2 px-6 rounded font-bold text-white ${
                                rating > 0 ? "bg-blue-500 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                            }`}
                            disabled={rating === 0}
                        >
                            Submit
                        </button>
                    </div>
                </>
            )}
            </div>
        </div>
    );
};

export default StarRating;