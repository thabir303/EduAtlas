from rest_framework import serializers
from django.conf import settings

from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    MAX_TEXT_LENGTH = 500
    MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024
    MAX_AUDIO_SIZE_BYTES = 2 * 1024 * 1024
    MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024

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
        media_type = data.get("media_type") or getattr(self.instance, "media_type", None)
        text_content = data.get("text_content", getattr(self.instance, "text_content", ""))
        file_obj = data.get("file", getattr(self.instance, "file", None))

        if media_type == "youtube" and not data.get("youtube_url"):
            raise serializers.ValidationError({"youtube_url": "Required for YouTube type."})

        if media_type in ["image", "audio", "video"] and not file_obj:
            raise serializers.ValidationError({"file": f"Required for {media_type} type."})

        if media_type == "text" and not text_content:
            raise serializers.ValidationError({"text_content": "Required for text type."})

        if media_type == "text" and len(text_content) > self.MAX_TEXT_LENGTH:
            raise serializers.ValidationError(
                {"text_content": f"Text content maximum length is {self.MAX_TEXT_LENGTH} characters."}
            )

        if media_type == "image" and file_obj and file_obj.size > self.MAX_IMAGE_SIZE_BYTES:
            raise serializers.ValidationError({"file": "Image maximum size is 1 MB."})

        if media_type == "audio" and file_obj and file_obj.size > self.MAX_AUDIO_SIZE_BYTES:
            raise serializers.ValidationError({"file": "Audio maximum size is 2 MB."})

        if media_type == "video" and file_obj and file_obj.size > self.MAX_VIDEO_SIZE_BYTES:
            raise serializers.ValidationError({"file": "Video maximum size is 2 MB."})

        return data
