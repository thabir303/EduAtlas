from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('media_assets', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mediaasset',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterModelOptions(
            name='mediaasset',
            options={'ordering': ['-updated_at', '-created_at']},
        ),
    ]
