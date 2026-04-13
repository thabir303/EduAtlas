from rest_framework import serializers

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
        ]
        extra_kwargs = {"file": {"write_only": True}}

    def get_file_url(self, obj):
        if obj.file:
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
