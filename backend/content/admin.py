from django.contrib import admin

from .models import ContentBlock, ExpandableSection, InlineAnnotation


class ExpandableSectionInline(admin.TabularInline):
	model = ExpandableSection
	extra = 1
	fields = ["title", "body", "order", "is_default_open"]


class InlineAnnotationInline(admin.TabularInline):
	model = InlineAnnotation
	extra = 0
	readonly_fields = ["annotation_id"]
	fields = ["term", "media_asset", "annotation_id"]


@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
	list_display = ["subject", "title", "updated_at"]
	inlines = [ExpandableSectionInline, InlineAnnotationInline]
	readonly_fields = ["created_at", "updated_at"]
