from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0002_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="event",
            name="embedding",
        ),
    ]
