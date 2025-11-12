from django.db import migrations
from pgvector.django import VectorField


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0005_post_embedding"),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE posts_post DROP COLUMN IF EXISTS embedding;",
            reverse_sql="ALTER TABLE posts_post ADD COLUMN embedding vector(3072);",
        ),
        migrations.AddField(
            model_name="post",
            name="embedding",
            field=VectorField(dimensions=3072, null=True, blank=True),
        ),
    ]
