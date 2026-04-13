from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import NotFound

from .models import ContentBlock, ExpandableSection, InlineAnnotation
from .serializers import (
	ContentBlockSerializer,
	ContentBlockUpdateSerializer,
	ExpandableSectionSerializer,
	InlineAnnotationSerializer,
)


class ContentBlockViewSet(viewsets.ModelViewSet):
	queryset = ContentBlock.objects.prefetch_related("annotations__media_asset", "expandable_sections").all()
	lookup_field = "id"

	def get_serializer_class(self):
		if self.action in ["update", "partial_update"]:
			return ContentBlockUpdateSerializer
		return ContentBlockSerializer

	def get_permissions(self):
		if self.action == "retrieve":
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]


class AnnotationByUUIDView(generics.RetrieveAPIView):
	serializer_class = InlineAnnotationSerializer
	permission_classes = [permissions.AllowAny]

	def get_object(self):
		annotation_id = self.kwargs.get("annotation_id")
		try:
			return InlineAnnotation.objects.select_related("media_asset").get(annotation_id=annotation_id)
		except InlineAnnotation.DoesNotExist as exc:
			raise NotFound("Annotation not found.") from exc


class ExpandableSectionViewSet(viewsets.ModelViewSet):
	queryset = ExpandableSection.objects.all()
	serializer_class = ExpandableSectionSerializer
	permission_classes = [permissions.IsAdminUser]


class InlineAnnotationViewSet(viewsets.ModelViewSet):
	queryset = InlineAnnotation.objects.select_related("media_asset", "content_block").all()
	serializer_class = InlineAnnotationSerializer

	def get_permissions(self):
		if self.action == "retrieve":
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]
