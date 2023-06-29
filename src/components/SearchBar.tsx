"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const [input, setInput] = useState("");
  const router = useRouter();

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["searchQuery"],
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios(`/api/search?q=${input}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    enabled: false,
  });

  const request = debounce(() => refetch(), 300);

  const debounceRequest = useCallback(() => {
    request();
  }, []);

  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    setInput("");
  });

  const pathname = usePathname();
  useEffect(() => {
    setInput("");
  }, [pathname]);

  return (
    <Command
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
      ref={ref}
    >
      <CommandInput
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search communities..."
        value={input}
        onValueChange={(value) => {
          setInput(value);
          debounceRequest();
        }}
      />
      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found</CommandEmpty>}
          {queryResults && queryResults.length > 0 && (
            <CommandGroup heading="Communities">
              {queryResults?.map((subreddit) => (
                <CommandItem
                  key={subreddit.id}
                  onSelect={(e) => {
                    router.push(`/p/${e}`);
                    router.refresh();
                  }}
                  value={subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/p/${subreddit.name}`}>/p/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
