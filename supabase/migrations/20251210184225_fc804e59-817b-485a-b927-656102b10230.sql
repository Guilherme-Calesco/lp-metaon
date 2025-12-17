-- Create storage bucket for seller photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendedor-fotos', 'vendedor-fotos', true);

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Anyone can view vendedor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendedor-fotos');

-- Allow authenticated admins to upload photos
CREATE POLICY "Admins can upload vendedor photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vendedor-fotos' AND has_role(auth.uid(), 'admin'));

-- Allow authenticated admins to update photos
CREATE POLICY "Admins can update vendedor photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vendedor-fotos' AND has_role(auth.uid(), 'admin'));

-- Allow authenticated admins to delete photos
CREATE POLICY "Admins can delete vendedor photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'vendedor-fotos' AND has_role(auth.uid(), 'admin'));