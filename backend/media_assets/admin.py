from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
	list_display = ["title", "media_type", "created_at"]
	list_filter = ["media_type"]
	search_fields = ["title", "media_type"]
