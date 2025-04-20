import fuzzysort from 'fuzzysort'
import { useState, useEffect, useRef } from 'react';

export type DropdownItem<T> = {
  key: string;
  text: string;
	type?: string;
  data: T;
}

type DropdownProps<T> = {
  items: DropdownItem<T>[];
  selectedItem?: DropdownItem<T>;
  onSelect: (item: DropdownItem<T>) => void;
  placeholder?: string;
  label?: string;
}

export const CustomDropdown = <T,>({ 
  items, 
  selectedItem, 
  onSelect, 
  placeholder = "Select an item", 
  label 
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredItems(fuzzysort.go(searchTerm, items, {
			keys: ['text'],
			limit: 40,
			threshold: 0.2,
			all: searchTerm.length == 0,
		}).map(item=>item.obj));
  }, [searchTerm, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate">
          {selectedItem ? selectedItem.text : placeholder}
        </span>
        <svg 
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 bg-white px-3 py-2 border-b">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul className="py-1">
            {filteredItems.map((item) => (
              <li
                key={item.key}
                className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
                  selectedItem?.key === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center">
                  {item.type!=null && (<span className="text-xs text-gray-500 mr-2 bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.type}
                  </span>)}
                  <span className={`block truncate ${selectedItem?.key === item.key ? 'font-medium' : 'font-normal'}`}>
                    {item.text}
                  </span>
                </div>
              </li>
            ))}
            {filteredItems.length === 0 && (
              <li className="py-2 px-3 text-gray-500 text-sm">No items found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};