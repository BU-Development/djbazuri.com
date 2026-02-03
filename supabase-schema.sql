-- Maak de links tabel aan voor de linktree functionaliteit
CREATE TABLE IF NOT EXISTS public.links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    "order" INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Maak de chats tabel aan voor klant communicatie
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Voeg een admin_email veld toe aan de configuratie (voor admin authenticatie)
CREATE TABLE IF NOT EXISTS public.site_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Voeg een standaard admin email toe (WIJZIG DIT NAAR JE EIGEN EMAIL)
INSERT INTO public.site_config (admin_email)
VALUES ('jouw-email@voorbeeld.com')
ON CONFLICT DO NOTHING;

-- Maak indexen aan voor betere prestaties
CREATE INDEX IF NOT EXISTS idx_links_visible_order ON public.links(visible, "order");
CREATE INDEX IF NOT EXISTS idx_chats_booking_id ON public.chats(booking_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at DESC);

-- Voeg Row Level Security (RLS) toe
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Policy voor links: iedereen kan lezen, maar alleen geauthenticeerde admins kunnen schrijven
CREATE POLICY "Iedereen kan zichtbare links lezen"
    ON public.links FOR SELECT
    USING (visible = true);

CREATE POLICY "Alleen geauthenticeerde gebruikers kunnen links beheren"
    ON public.links FOR ALL
    USING (auth.role() = 'authenticated');

-- Policy voor chats: gebruikers kunnen alleen hun eigen chats zien
CREATE POLICY "Gebruikers kunnen hun eigen chats lezen"
    ON public.chats FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE email IN (
            SELECT admin_email FROM public.site_config
        )
    ));

CREATE POLICY "Gebruikers kunnen chats aanmaken"
    ON public.chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy voor site_config: alleen admins kunnen lezen
CREATE POLICY "Alleen geauthenticeerde gebruikers kunnen config lezen"
    ON public.site_config FOR SELECT
    USING (auth.role() = 'authenticated');

-- Functie om updated_at automatisch bij te werken
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger voor links tabel
DROP TRIGGER IF EXISTS update_links_updated_at ON public.links;
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON public.links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
