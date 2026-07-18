import { useRef, useState } from 'react';
import type { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import userService from '@/services/user-service';
import type { UserRow } from '@/services/user-service';
import { cn } from '@/lib/utils';

const initialsOf = (name: string | null) =>
  (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

interface UserPickerProps {
  value: UserRow | null;
  onChange: (user: UserRow | null) => void;
}

/** Searchable user dropdown, used to target a single user for a notification. */
const UserPicker: FC<UserPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<number | undefined>(undefined);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebouncedSearch(v.trim()), 350);
  };

  const { data: listRes, isLoading } = useQuery({
    queryKey: ['user-picker', debouncedSearch],
    queryFn: () => userService.list({ limit: 8, search: debouncedSearch || undefined }),
    enabled: isOpen,
  });

  const results = listRes?.data ?? [];

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-brand-green/40 bg-brand-green/5 px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-xs font-semibold text-brand-green">
          {initialsOf(value.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{value.name}</p>
          <p className="truncate text-xs text-gray-500">{value.email}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50"
      >
        <span>Search for a user by name or email...</span>
        <ChevronDown
          size={16}
          className={cn('text-gray-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Type a name or email..."
              className="w-full text-sm text-gray-700 outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            ) : results.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-gray-400">
                {debouncedSearch ? 'No users found.' : 'Start typing to search users.'}
              </p>
            ) : (
              results.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onChange(u);
                    setIsOpen(false);
                    setSearch('');
                    setDebouncedSearch('');
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {initialsOf(u.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPicker;
