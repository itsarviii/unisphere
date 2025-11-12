from django.db import migrations
from pgvector.django import VectorField


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0005_event_embedding"),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE events_event DROP COLUMN IF EXISTS embedding;",
            reverse_sql="ALTER TABLE events_event ADD COLUMN embedding vector(3072);",
        ),
        migrations.AddField(
            model_name="event",
            name="embedding",
            field=VectorField(dimensions=3072, null=True, blank=True),
        ),
    ]
