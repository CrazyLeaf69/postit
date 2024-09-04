"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVotestAmount: number;
  initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({ postId, initialVotestAmount, initialVote }) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState(initialVotestAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previousVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (error, voteType) => {
      setVotesAmount((prev) => (voteType === "UP" ? prev - 1 : prev + 1));
      // reset current vote
      setCurrentVote(previousVote);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
        return toast({
          title: "Something went wrong",
          description: "You vote was not registered, please try again later.",
          variant: "destructive",
        });
      }
    },
    onMutate: (voteType) => {
      if (currentVote === voteType) {
        setCurrentVote(undefined);
        setVotesAmount((prev) => (voteType === "UP" ? prev - 1 : prev + 1));
      } else {
        setCurrentVote(voteType);
        setVotesAmount((prev) => (voteType === "UP" ? prev + (currentVote ? 2 : 1) : prev - (currentVote ? 2 : 1)));
      }
    },
  });

  return (
    <div className="flex flex-col gap-0 pb-4 pr-6 sm:w-20 sm:pb-0">
      <Button size={"sm"} onClick={() => vote("UP")} variant={"ghost"} aria-label="upvote">
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="py-2 text-sm font-medium text-center text-zinc-900">{votesAmount}</p>

      <Button size={"sm"} onClick={() => vote("DOWN")} variant={"ghost"} aria-label="downvote">
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
