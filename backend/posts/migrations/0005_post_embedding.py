from django.db import migrations
from pgvector.django import VectorField


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0004_postlike_comment"),
    ]

    operations = [
        migrations.RunSQL("CREATE EXTENSION IF NOT EXISTS vector;"),
        migrations.AddField(
            model_name="post",
            name="embedding",
            field=VectorField(dimensions=768, null=True, blank=True),
        ),
    ]
