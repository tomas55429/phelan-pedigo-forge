-- Add admin_settings to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;

-- Enable realtime for admin_settings table
ALTER TABLE public.admin_settings REPLICA IDENTITY FULL;