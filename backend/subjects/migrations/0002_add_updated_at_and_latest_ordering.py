from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('subjects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subcategory',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['-updated_at', '-created_at'], 'verbose_name_plural': 'Categories'},
        ),
        migrations.AlterModelOptions(
            name='subcategory',
            options={'ordering': ['-updated_at', '-created_at'], 'verbose_name_plural': 'Subcategories'},
        ),
        migrations.AlterModelOptions(
            name='subject',
            options={'ordering': ['-updated_at', '-created_at']},
        ),
    ]
