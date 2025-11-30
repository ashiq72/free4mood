import { useState } from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/api/post";

// API

export const PopoverModule = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { title, description };
      await createPost(payload);

      // success UI
      alert("Post created!");

      // reset form
      setTitle("");
      setDescription("");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <PopoverContent
      className='w-[360px] rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4'
      align='start'
    >
      <div className='w-full'>
        {/* Header */}
        <div className='mb-4 border-b pb-3'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Create a Post
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Share your thoughts with your friends.
          </p>
        </div>

        {/* FORM */}
        <form className='space-y-5' onSubmit={handleCreatePost}>
          <FieldGroup>
            <FieldSet className='space-y-3'>
              <Field>
                <FieldLabel htmlFor='post-title'>Title</FieldLabel>
                <Input
                  id='post-title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Add a short title'
                  className='bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700'
                  required
                />
              </Field>
            </FieldSet>

            <FieldSeparator />

            <FieldSet className='space-y-3'>
              <Field>
                <FieldLabel htmlFor='post-description'>Description</FieldLabel>
                <Textarea
                  id='post-description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's on your mind?"
                  className='resize-none h-28 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700'
                />
              </Field>
            </FieldSet>

            {/* Buttons */}
            <div className='pt-4 flex justify-end gap-3'>
              <Button variant='outline' type='button'>
                Cancel
              </Button>

              <Button type='submit' disabled={loading}>
                {loading ? "Posting..." : "Submit"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </PopoverContent>
  );
};
