import { Star } from "lucide-react";

export const Stars = ({
  rating,
  numberOfRatings,
}: {
  rating: number;
  numberOfRatings: number;
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating.toFixed(1)} ({numberOfRatings})
      </span>
    </div>
  );
};
