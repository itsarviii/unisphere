from django.db import migrations
from pgvector.django import VectorField


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0004_eventattendee"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="embedding",
            field=VectorField(dimensions=768, null=True, blank=True),
        ),
    ]
