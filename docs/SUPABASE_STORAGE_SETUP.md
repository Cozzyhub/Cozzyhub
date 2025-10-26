# Supabase Storage Setup for Product Images

## Create Storage Bucket

You need to create a storage bucket in Supabase for product images to work with automatic optimization.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard

2. **Open Storage**
   - Click on "Storage" in the left sidebar

3. **Create New Bucket**
   - Click "New bucket"
   - Name: `products`
   - Public bucket: **Yes** (enable public access)
   - File size limit: 10 MB (or your preference)
   - Allowed MIME types: `image/*`

4. **Set Bucket Policies (Important!)**

   Go to the bucket settings and add these policies:

   **Upload Policy** (for authenticated users):
   ```sql
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'products');
   ```

   **Public Read Policy** (for everyone to view images):
   ```sql
   CREATE POLICY "Allow public reads"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'products');
   ```

   **Delete Policy** (for authenticated users):
   ```sql
   CREATE POLICY "Allow authenticated deletes"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'products');
   ```

### Alternative: Use SQL Editor

You can also run this SQL in the Supabase SQL Editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Set up policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
```

## How It Works

When you upload a product image in the admin dashboard:

1. **Select File**: You select an image file (JPG, PNG, GIF, etc.)
2. **Auto-Optimization**: Image is automatically optimized to WebP format using Sharp
3. **Compression**: Resized to max 1920x1080 with 85% quality
4. **Upload**: Optimized image is uploaded to Supabase Storage
5. **URL**: Public URL is automatically saved to the product record

## Benefits

- **25-35% smaller file sizes** with WebP format
- **Consistent quality** across all product images
- **Fast loading** for better user experience
- **Automatic processing** - no manual optimization needed
- **Secure**: Only authenticated admin users can upload

## Testing

After setup, test by:
1. Go to `/admin/products/new`
2. Click "Click to upload" or drag an image
3. Wait for "Image optimized and uploaded" confirmation
4. Submit the form
5. Check the product displays correctly on the storefront
