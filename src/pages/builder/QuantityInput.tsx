import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "../../components/ui/button";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  maxQuantity: number;
  minQuantity?: number;
  className?: string;
}

export const QuantityInput = ({
  value,
  onChange,
  maxQuantity,
  minQuantity = 0,
  className = "",
}: QuantityInputProps) => {
  const [quantity, setQuantity] = useState(value);

  useEffect(() => {
    setQuantity(value);
  }, [value]);

  const increment: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < maxQuantity) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange(newValue);
    }
  };

  const decrement: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > minQuantity) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      const boundedValue = Math.min(
        Math.max(newValue, minQuantity),
        maxQuantity
      );
      setQuantity(boundedValue);
      onChange(boundedValue);
    }
  };

  return (
    <div
      className={`flex bg-white items-center border rounded-md ${className}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="small-icon"
        className="p-1 border-r aspect-square rounded-none hover:bg-gray-100 disabled:opacity-50 focus:bg-gray-100"
        onClick={decrement}
        disabled={quantity <= minQuantity}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </Button>

      <input
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className="w-6 text-center text-sm focus:outline-none py-0.5"
        min={minQuantity}
        max={maxQuantity}
        aria-label="Quantity"
      />

      <Button
        type="button"
        variant="ghost"
        size="small-icon"
        className="p-1 border-l aspect-square rounded-none hover:bg-gray-100 disabled:opacity-50 focus:bg-gray-100"
        onClick={increment}
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
};
