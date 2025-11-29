import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const PopoverModule = () => {
  return (
    <PopoverContent
      className="w-[360] rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4"
      align="start"
    >
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create a Post
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your thoughts with your friends.
          </p>
        </div>

        <form className="space-y-5">
          <FieldGroup>
            {/* Title */}
            <FieldSet className="space-y-3">
              <Field>
                <FieldLabel htmlFor="post-title">Title</FieldLabel>
                <Input
                  id="post-title"
                  placeholder="Add a short title"
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  required
                />
              </Field>
            </FieldSet>

            <FieldSeparator />

            {/* Description */}
            <FieldSet className="space-y-3">
              <Field>
                <FieldLabel htmlFor="post-description">Description</FieldLabel>
                <Textarea
                  id="post-description"
                  placeholder="What's on your mind?"
                  className="resize-none h-28 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                />
              </Field>
            </FieldSet>

            {/* Buttons */}
            <div className="pt-4 flex justify-end gap-3">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </PopoverContent>
  );
};
