from rest_framework import serializers

from media_assets.models import MediaAsset
from media_assets.serializers import MediaAssetSerializer
from subjects.models import Subject
from .models import ContentBlock, ExpandableSection, InlineAnnotation


class ExpandableSectionSerializer(serializers.ModelSerializer):
    content_block = serializers.PrimaryKeyRelatedField(
        queryset=ContentBlock.objects.all(),
        write_only=True,
    )

    class Meta:
        model = ExpandableSection
        fields = ["id", "title", "body", "order", "is_default_open", "content_block"]


class InlineAnnotationSerializer(serializers.ModelSerializer):
    media_asset = MediaAssetSerializer(read_only=True)
    content_block_id = serializers.PrimaryKeyRelatedField(
        queryset=ContentBlock.objects.all(), source="content_block", write_only=True, required=False
    )
    media_asset_id = serializers.PrimaryKeyRelatedField(
        queryset=MediaAsset.objects.all(), source="media_asset", write_only=True
    )

    class Meta:
        model = InlineAnnotation
        fields = [
            "id",
            "term",
            "annotation_id",
            "media_asset",
            "media_asset_id",
            "content_block_id",
        ]


class ContentBlockSerializer(serializers.ModelSerializer):
    expandable_sections = ExpandableSectionSerializer(many=True, read_only=True)
    annotations = InlineAnnotationSerializer(many=True, read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source="subject", write_only=True, required=False
    )

    class Meta:
        model = ContentBlock
        fields = [
            "id",
            "title",
            "body",
            "expandable_sections",
            "annotations",
            "updated_at",
            "subject_id",
        ]

    def validate_body(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Body must be a list of paragraph nodes.")

        for node in value:
            if not isinstance(node, dict) or node.get("type") != "paragraph":
                raise serializers.ValidationError(
                    "Each node must be a paragraph object with type='paragraph'."
                )
            if not isinstance(node.get("content", []), list):
                raise serializers.ValidationError("Each paragraph must have a 'content' list.")
        return value


class ContentBlockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = ["title", "body"]
