-- Run this in Supabase SQL Editor after applying the bilingual migration.
-- The first result should eventually return zero rows before validating constraints.

select 'birds' as source, id
from public.birds
where content_status = 'published'
  and (
    nullif(btrim(name_en), '') is null
    or nullif(btrim(description_en), '') is null
  )

union all

select 'bird_foods', id
from public.bird_foods
where content_status = 'published'
  and (
    nullif(btrim(name_en), '') is null
    or benefits_en is null
    or cardinality(benefits_en) <> cardinality(benefits)
    or exists (
      select 1 from unnest(benefits_en) item
      where nullif(btrim(item), '') is null
    )
    or (
      nullif(btrim(note), '') is not null
      and nullif(btrim(note_en), '') is null
    )
  )

union all

select 'toxic_entries', id
from public.toxic_entries
where content_status = 'published'
  and (
    nullif(btrim(name_en), '') is null
    or nullif(btrim(explanation_en), '') is null
  )

union all

select 'portion_rules', id
from public.portion_rules
where content_status = 'published'
  and (
    nullif(btrim(teaspoon_en), '') is null
    or nullif(btrim(morning_en), '') is null
    or nullif(btrim(evening_en), '') is null
  )

union all

select 'recipes', id
from public.recipes
where content_status = 'published'
  and (
    nullif(btrim(title_en), '') is null
    or nullif(btrim(purpose_en), '') is null
  )
order by source, id;

-- Published recipe lines must also be complete.
select 'recipe_ingredients' as source, ingredient.recipe_id, ingredient.sort_order
from public.recipe_ingredients as ingredient
join public.recipes as recipe on recipe.id = ingredient.recipe_id
where recipe.content_status = 'published'
  and nullif(btrim(ingredient.ingredient_en), '') is null

union all

select 'recipe_steps', step.recipe_id, step.sort_order
from public.recipe_steps as step
join public.recipes as recipe on recipe.id = step.recipe_id
where recipe.content_status = 'published'
  and nullif(btrim(step.instruction_en), '') is null
order by source, recipe_id, sort_order;

-- Every published bird should have all four dashboard sections ready.
select bird.id,
  not exists (
    select 1 from public.bird_foods food
    where food.bird_id = bird.id and food.content_status = 'published'
  ) as missing_food,
  not exists (
    select 1 from public.portion_rules portion
    where portion.bird_id = bird.id and portion.content_status = 'published'
  ) as missing_portion,
  not exists (
    select 1 from public.toxic_entries safety
    where safety.content_status = 'published'
      and (safety.bird_id is null or safety.bird_id = bird.id)
  ) as missing_safety,
  not exists (
    select 1 from public.recipes recipe
    where recipe.bird_id = bird.id and recipe.content_status = 'published'
  ) as missing_recipe
from public.birds bird
where bird.content_status = 'published'
  and (
    not exists (
      select 1 from public.bird_foods food
      where food.bird_id = bird.id and food.content_status = 'published'
    )
    or not exists (
      select 1 from public.portion_rules portion
      where portion.bird_id = bird.id and portion.content_status = 'published'
    )
    or not exists (
      select 1 from public.toxic_entries safety
      where safety.content_status = 'published'
        and (safety.bird_id is null or safety.bird_id = bird.id)
    )
    or not exists (
      select 1 from public.recipes recipe
      where recipe.bird_id = bird.id and recipe.content_status = 'published'
    )
  )
order by bird.id;

-- Run these only after all audits above return zero rows.
-- alter table public.birds validate constraint birds_published_english_complete;
-- alter table public.bird_foods validate constraint bird_foods_published_english_complete;
-- alter table public.toxic_entries validate constraint toxic_entries_published_english_complete;
-- alter table public.portion_rules validate constraint portion_rules_published_english_complete;
-- alter table public.recipes validate constraint recipes_published_english_complete;
