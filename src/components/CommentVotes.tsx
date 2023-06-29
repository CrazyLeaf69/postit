"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { VoteType, CommentVote } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { FC, useState } from "react";
import { Button } from "./ui/Button";

interface CommentVoteProps {
  commentId: string;
  initialVotesAmount: number;
  initialVote?: Pick<CommentVote, "type">;
}

const CommentVote: FC<CommentVoteProps> = ({
  commentId,
  initialVotesAmount,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previousVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
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
    onMutate: (type) => {
      if (currentVote?.type === type) {
        setCurrentVote(undefined);
        setVotesAmount((prev) => (type === "UP" ? prev - 1 : prev + 1));
      } else {
        setCurrentVote({ type });
        setVotesAmount((prev) =>
          type === "UP"
            ? prev + (currentVote ? 2 : 1)
            : prev - (currentVote ? 2 : 1)
        );
      }
    },
  });

  // console.log(currentVote);

  return (
    <div className="flex gap-1">
      <Button
        size={"sm"}
        onClick={() => vote("UP")}
        variant={"ghost"}
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmount}
      </p>

      <Button
        size={"sm"}
        onClick={() => vote("DOWN")}
        variant={"ghost"}
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVote;
