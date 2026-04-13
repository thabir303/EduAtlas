from django.contrib import admin

from .models import Category, Subcategory, Subject


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ["name", "slug", "created_at"]
	search_fields = ["name", "slug"]


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
	list_display = ["name", "category", "slug", "created_at"]
	list_filter = ["category"]
	search_fields = ["name", "slug", "category__name"]


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
	list_display = ["title", "subcategory", "slug", "updated_at"]
	list_filter = ["subcategory__category", "subcategory"]
	search_fields = ["title", "slug", "subcategory__name", "subcategory__category__name"]
