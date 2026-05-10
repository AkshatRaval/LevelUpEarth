-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  origin text,
  interests text[],
  onboarded boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "Public profiles are viewable by everyone." on profiles for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- AUTO-PROFILE TRIGGER FOR NEW SIGNUPS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Safely drop and recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Actions Table
-- The table already exists, so we just add the missing columns
alter table public.actions 
  add column if not exists title text default 'Untitled',
  add column if not exists description text,
  add column if not exists likes_count integer default 0,
  add column if not exists comments_count integer default 0,
  add column if not exists status text default 'pending',
  add column if not exists image_hash text unique;

-- FIX FOR FOREIGN KEY (400 BAD REQUEST ERROR)
-- First, ensure any existing user_id in actions has a profile, otherwise the foreign key will fail
insert into public.profiles (id)
select distinct user_id from public.actions
on conflict (id) do nothing;

-- Now safely add the foreign key
alter table public.actions drop constraint if exists actions_user_id_fkey;
alter table public.actions add constraint actions_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.actions enable row level security;

do $$ begin
  create policy "Actions are viewable by everyone." on actions for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own actions." on actions for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own actions." on actions for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- 3. Likes Table
create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action_id uuid references public.actions(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, action_id)
);

alter table public.likes enable row level security;

do $$ begin
  create policy "Likes are viewable by everyone." on likes for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own likes." on likes for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their own likes." on likes for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Trigger to update likes_count on actions table
create or replace function public.handle_like_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.actions set likes_count = likes_count + 1 where id = NEW.action_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.actions set likes_count = likes_count - 1 where id = OLD.action_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

do $$ begin
  create trigger on_like_change
    after insert or delete on public.likes
    for each row execute procedure public.handle_like_count();
exception when duplicate_object then null; end $$;


-- 4. Comments Table
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action_id uuid references public.actions(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;

do $$ begin
  create policy "Comments are viewable by everyone." on comments for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own comments." on comments for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their own comments." on comments for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Trigger to update comments_count on actions table
create or replace function public.handle_comment_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.actions set comments_count = comments_count + 1 where id = NEW.action_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.actions set comments_count = comments_count - 1 where id = OLD.action_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

do $$ begin
  create trigger on_comment_change
    after insert or delete on public.comments
    for each row execute procedure public.handle_comment_count();
exception when duplicate_object then null; end $$;


-- 5. Storage Buckets & Policies
-- Create the avatars bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable public access to avatars
do $$ begin
  create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
exception when duplicate_object then null; end $$;

-- Enable upload access
do $$ begin
  create policy "Users can upload their own avatar." on storage.objects for insert with check ( bucket_id = 'avatars' and auth.uid() = owner );
exception when duplicate_object then null; end $$;

-- Enable update access
do $$ begin
  create policy "Users can update their own avatar." on storage.objects for update using ( bucket_id = 'avatars' and auth.uid() = owner );
exception when duplicate_object then null; end $$;
