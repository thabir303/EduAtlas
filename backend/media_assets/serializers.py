from rest_framework import serializers
from django.conf import settings

from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            "id",
            "title",
            "media_type",
            "text_content",
            "file",
            "file_url",
            "youtube_url",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {"file": {"write_only": True}}

    def get_file_url(self, obj):
        if obj.file:
            if getattr(settings, "USE_CLOUDFLARE_R2", False):
                # For R2, always return the public delivery URL so clients don't hit the private API endpoint.
                media_base = str(getattr(settings, "MEDIA_URL", "")).rstrip("/")
                if media_base.startswith("http"):
                    return f"{media_base}/{obj.file.name.lstrip('/')}"

            request = self.context.get("request")
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None

    def validate(self, data):
        media_type = data.get("media_type")

        if media_type == "youtube" and not data.get("youtube_url"):
            raise serializers.ValidationError({"youtube_url": "Required for YouTube type."})

        if media_type in ["image", "audio", "video"] and not data.get("file"):
            raise serializers.ValidationError({"file": f"Required for {media_type} type."})

        if media_type == "text" and not data.get("text_content"):
            raise serializers.ValidationError({"text_content": "Required for text type."})

        return data
