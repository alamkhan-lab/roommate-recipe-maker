
CREATE TABLE public.recipe_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_name TEXT NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
ON public.recipe_feedback
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read feedback"
ON public.recipe_feedback
FOR SELECT
USING (true);
