select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('admin_users', 'content_audit_log', 'bird_requests')
order by table_name;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('is_petbites_admin', 'submit_bird_request')
order by routine_name;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in (
    'admin_users',
    'content_audit_log',
    'bird_requests',
    'birds',
    'bird_foods',
    'toxic_entries',
    'portion_rules',
    'recipes',
    'recipe_ingredients',
    'recipe_steps',
    'objects'
  )
order by schemaname, tablename, policyname;
