"use client";
import { INFINITE_SCROLLING_PAGINATION_RESULT } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef } from "react";
import Post from "./Post";
import { Loader2 } from "lucide-react";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {
  const lastPostRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULT}&page=${pageParam}${
        !!subredditName ? `&subredditName=${subredditName}` : ""
      }`;

      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmount = post.votes.reduce(
          (acc, vote) => (vote.type === "UP" ? acc + 1 : acc - 1),
          0
        );

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user?.id
        );

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                currentVote={currentVote}
                subredditName={post.subreddit.name}
                post={post}
                commentAmount={post.comments.length}
                votesAmount={votesAmount}
              />
            </li>
          );
        } else {
          return (
            <Post
              key={post.id}
              currentVote={currentVote}
              subredditName={post.subreddit.name}
              post={post}
              commentAmount={post.comments.length}
              votesAmount={votesAmount}
            />
          );
        }
      })}

      {isFetchingNextPage && (
        <li className="flex justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </li>
      )}
    </ul>
  );
};

export default PostFeed;
