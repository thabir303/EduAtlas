from rest_framework import serializers

from content.serializers import ContentBlockSerializer
from .models import Category, Subcategory, Subject


class SubjectListSerializer(serializers.ModelSerializer):
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)
    category_name = serializers.CharField(source="subcategory.category.name", read_only=True)
    subcategory_slug = serializers.CharField(source="subcategory.slug", read_only=True)
    category_slug = serializers.CharField(source="subcategory.category.slug", read_only=True)
    subcategory = serializers.PrimaryKeyRelatedField(
        queryset=Subcategory.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Subject
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "subcategory_name",
            "category_name",
            "subcategory_slug",
            "category_slug",
            "subcategory",
        ]

    def create(self, validated_data):
        subject = super().create(validated_data)

        # Guarantee editor readiness for every newly created subject.
        from content.models import ContentBlock

        ContentBlock.objects.get_or_create(
            subject=subject,
            defaults={
                "title": subject.title,
                "body": [],
            },
        )

        return subject


class SubjectDetailSerializer(serializers.ModelSerializer):
    content_block = ContentBlockSerializer(read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)
    category_name = serializers.CharField(source="subcategory.category.name", read_only=True)
    subcategory_slug = serializers.CharField(source="subcategory.slug", read_only=True)
    category_slug = serializers.CharField(source="subcategory.category.slug", read_only=True)

    class Meta:
        model = Subject
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "subcategory_name",
            "category_name",
            "subcategory_slug",
            "category_slug",
            "content_block",
            "updated_at",
        ]


class SubcategorySerializer(serializers.ModelSerializer):
    subjects = SubjectListSerializer(many=True, read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
    )
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Subcategory
        fields = ["id", "name", "slug", "description", "subjects", "category", "category_name"]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "subcategories"]
