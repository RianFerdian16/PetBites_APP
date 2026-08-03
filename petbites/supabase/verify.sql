select 'app_features' as table_name, count(*) as row_count from public.app_features
union all
select 'birds', count(*) from public.birds
union all
select 'bird_foods', count(*) from public.bird_foods
union all
select 'toxic_entries', count(*) from public.toxic_entries
union all
select 'portion_rules', count(*) from public.portion_rules
union all
select 'recipes', count(*) from public.recipes
union all
select 'recipe_ingredients', count(*) from public.recipe_ingredients
union all
select 'recipe_steps', count(*) from public.recipe_steps
order by table_name;

-- Pemeriksaan relasi yang tidak lengkap. Semua hasil seharusnya 0.
select 'foods_without_bird' as check_name, count(*) as problem_count
from public.bird_foods f
left join public.birds b on b.id = f.bird_id
where b.id is null
union all
select 'portions_without_bird', count(*)
from public.portion_rules p
left join public.birds b on b.id = p.bird_id
where b.id is null
union all
select 'recipes_without_bird', count(*)
from public.recipes r
left join public.birds b on b.id = r.bird_id
where b.id is null
union all
select 'ingredients_without_recipe', count(*)
from public.recipe_ingredients i
left join public.recipes r on r.id = i.recipe_id
where r.id is null
union all
select 'steps_without_recipe', count(*)
from public.recipe_steps s
left join public.recipes r on r.id = s.recipe_id
where r.id is null;
