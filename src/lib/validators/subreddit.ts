import { z } from "zod";

const regex = /^[a-zA-Z0-9_]*$/; // no space
export const SubredditValidator = z.object({
  // regex no space
  name: z.string().min(3).max(21).regex(regex, "No spaces allowed"),
});

export const SubredditSubscriptionValidator = z.object({
  subredditId: z.string(),
});

export type CreateSubreditPayload = z.infer<typeof SubredditValidator>;
export type SubscribeToSubredditPayload = z.infer<
  typeof SubredditSubscriptionValidator
>;
