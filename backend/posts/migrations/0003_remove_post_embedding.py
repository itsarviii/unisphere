from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0002_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="post",
            name="embedding",
        ),
    ]
